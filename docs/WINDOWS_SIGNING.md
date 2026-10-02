# Windows code signing

**"Unknown Publisher" cannot be fixed by branding.** The `AppPublisher` in `installer.iss` and the product name in
`apps/desktop/package.json` are only labels. Windows shows a verified publisher only when the executables and the
installer carry an **Authenticode signature** from a certificate that chains to a trusted authority.

## What to sign

| File | Signed by |
| --- | --- |
| `dist-desktop\win-unpacked\Narrative Integrity Engine.exe` (and the app's other `.exe`/`.dll`) | electron-builder, during `npm run build:desktop` |
| `dist-installer\Narrative Integrity Engine Setup <version>.exe` (and the uninstaller) | Inno Setup `SignTool`, during `iscc` |

Sign the app **before** it is packed into the installer, then sign the installer. Always timestamp, so signatures stay
valid after the certificate expires.

## Getting a certificate

- **Azure Trusted Signing** (cloud, no hardware token; individuals/organisations in supported regions), or
- an **OV/EV code-signing certificate** from a public CA (EV gives immediate SmartScreen reputation; OV builds it over time).

Keep keys out of the repository (`*.pfx`, `*.p12`, `*.pem` are git-ignored).

## electron-builder (the app)

Set environment variables before `npm run build:desktop`:

```powershell
$env:CSC_LINK = "C:\secure\nie-codesign.pfx"      # or a base64 string / https URL
$env:CSC_KEY_PASSWORD = "<password>"
npm run build:desktop
```

For Azure Trusted Signing, add `win.azureSignOptions` (endpoint, account, certificate profile) to the `build` block in
`apps/desktop/package.json` and authenticate with the standard Azure environment variables. See the electron-builder
"Code Signing" docs for the current option names.

## Inno Setup (the installer)

1. In Inno Setup: **Tools → Configure Sign Tools…**, add a tool named `nie_sign` with a command such as  
   `signtool.exe sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /f "C:\secure\nie-codesign.pfx" /p $p $f`
2. In `installer.iss`, uncomment `SignTool=nie_sign $f` and `SignedUninstaller=yes`.
3. Compile with `iscc installer.iss`.

## Verify

```powershell
signtool verify /pa /v "dist-installer\Narrative Integrity Engine Setup 0.1.0.exe"
Get-AuthenticodeSignature "dist-desktop\win-unpacked\Narrative Integrity Engine.exe"
```

The auto-updater (electron-updater) also checks the publisher of downloaded updates on Windows, so signing is required
for production updates to install (see "Updates" in `docs/BUILDING.md`).
