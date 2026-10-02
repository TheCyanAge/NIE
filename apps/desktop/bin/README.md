# llama.cpp runtime

This folder holds the **entire** llama.cpp runtime, not just `llama-server.exe`. The binaries are not committed;
fetch them with `npm run fetch:runtime` from the repository root (it downloads the Windows CPU build
`llama-b9085-bin-win-cpu-x64.zip` and extracts everything here).

Required next to `llama-server.exe` (NIE refuses to pretend the offline model works without them):

- `llama.dll`, `ggml.dll`, `ggml-base.dll`
- at least one CPU backend, `ggml-cpu*.dll`  (without it llama-server reports **"no backends are loaded"**)
- `llama-common.dll`, `mtmd.dll` (expected by this build)

The packaged app copies this folder to `resources\bin`.
