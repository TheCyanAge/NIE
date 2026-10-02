# Building NIE for Windows

## The easy way: GitHub Actions (no tools needed on your PC)

`.github/workflows/windows-package.yml` does everything below on a Windows runner and proves the result works:
build → **smoke test of the packaged exe with the real llama.cpp runtime and the real Qwen model** → Inno Setup installer →
silent install (checks the program and the desktop shortcut) → smoke test of the *installed* copy → clean uninstall.
Run it from **Actions → windows-package → Run workflow**, then download the artifacts (`NIE-Windows-Setup`, `NIE-Windows-portable`,
`NIE-smoke-report` with screenshots and logs). Inputs: put the model inside the installer (about 2.2 GB, fully offline) or let setup
download it; skip the unit tests (they also run in the `ci` workflow); also upload the portable folder.

The smoke test (`scripts/smoke-windows.mjs <folder>`) can be run by hand against any unpacked build. It attaches to the real window over the
DevTools protocol and checks: complete runtime next to `llama-server`, valid model, UI opens with the desktop bridges and no Node access in the page,
status goes starting → "Offline NIE ready." only after the model really answered, a real Brainstorm question is answered by the offline model,
and the project survives closing and reopening.

## By hand on your own PC

Prerequisites on the build machine: **Node.js 22+**, **npm**, **Inno Setup 6** (`iscc`), and (for the icon step only) a Chromium
that Playwright can find. Work in a plain folder such as `C:\NIE`, not OneDrive.

```powershell
cd C:\NIE
npm install                         # root dev tools (tests, icons)
npm --prefix apps\desktop install   # electron, electron-builder, electron-updater
npm run fetch:runtime               # FULL llama.cpp CPU runtime into apps\desktop\bin + the Qwen model into apps\desktop\models
npm test                            # unit/integration tests (fast, no browser)
npm run test:ui                     # end-to-end UI tests (needs Chromium)
npm run build:desktop               # → dist-desktop\win-unpacked\Narrative Integrity Engine.exe
iscc installer.iss                  # → dist-installer\Narrative Integrity Engine Setup <version>.exe
```

Quick manual test without installing: run `dist-desktop\win-unpacked\Narrative Integrity Engine.exe` (this is much faster
than reinstalling every time). For development: `npm run desktop`.

## The offline runtime (the lesson from b9085)

`resources\bin` must hold the **entire** llama.cpp runtime, not just `llama-server.exe`:

```
llama-server.exe  llama.dll  llama-common.dll  ggml.dll  ggml-base.dll  ggml-cpu*.dll  mtmd.dll
```

Without a CPU backend (`ggml-cpu*.dll`) llama-server prints `no backends are loaded` / `failed to load model`.
`npm run fetch:runtime` extracts the whole release zip next to the server and verifies it; at run time NIE validates it again
and starts `llama-server` with its own folder as the working directory and first on `PATH`.

The model (`Qwen2.5-3B-Instruct-Q4_K_M.gguf`, ≈1.93 GB) is either bundled in `resources\models` or, if absent, downloaded
(resumably, with header and size verification) during setup or on first launch.

## Updates

`apps\desktop\updater-config.json` ships with empty placeholders, and NIE reports honestly that updates are not configured.
To go live: set `owner`/`repo`, publish releases with electron-builder (`publish` in the build config) including
`latest.yml`, and sign the build (`docs/WINDOWS_SIGNING.md`).

## Icons

`npm run icons` regenerates `assets\icon.ico` (256/128/64/48/32/16 px; the three small sizes use a bolder, text-free
variant so they stay legible), `assets\icon.png` and the installer wizard bitmaps from `assets\logo.svg`.
`python scripts/make-logo.py` regenerates the SVGs themselves (needs `pip install fonttools`).
