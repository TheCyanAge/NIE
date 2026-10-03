; Narrative Integrity Engine: Inno Setup 6 installer.
;
; Build order (see docs/BUILDING.md):
;   npm install && npm run fetch:runtime && npm run icons && npm run build:desktop     -> dist-desktop\win-unpacked
;   iscc installer.iss                                                                 -> dist-installer\Narrative Integrity Engine Setup <version>.exe
;
; NOT compiled in this repository's CI (no Windows/Inno there): compile it on Windows and test the result.

#define MyAppName       "Narrative Integrity Engine"
#define MyAppShort      "NIE"
; The build passes /DMyAppVersion=<apps/desktop/package.json version>; this is only the default for a manual compile.
#ifndef MyAppVersion
  #define MyAppVersion  "0.1.0"
#endif
#define MyAppPublisher  "TheCyanAge"
#define MyAppExeName    "Narrative Integrity Engine.exe"
#define BuildDir        "dist-desktop\win-unpacked"
#define ModelFile       "Qwen2.5-3B-Instruct-Q4_K_M.gguf"
#define ModelUrl        "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf"
; If the model was bundled into the build, ship it; otherwise download it during setup.
#define BundledModel    FileExists(SourcePath + BuildDir + "\resources\models\" + ModelFile)

[Setup]
; Keep this GUID forever: it is how Windows recognises upgrades of the same app. It is the same AppId as the earlier
; NIE installer, so installing this over that one upgrades it instead of leaving two entries in Add/Remove Programs.
AppId={{9F0D8580-3877-4D07-A618-69C2AE30C566}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=dist-installer
OutputBaseFilename={#MyAppName} Setup {#MyAppVersion}
SetupIconFile=assets\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}
WizardStyle=modern
WizardImageFile=assets\wizard-large.bmp
WizardSmallImageFile=assets\wizard-small.bmp
; Per-user install by default (no admin prompt, and auto-updates work without elevation); the user can choose all-users.
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
RestartApplications=no
; The model is already compressed; solid compression would only slow setup down.
Compression=lzma2/fast
SolidCompression=no
; Authenticode: uncomment and point at your signtool command to sign the installer and uninstaller (docs/WINDOWS_SIGNING.md).
; SignTool=nie_sign $f
; SignedUninstaller=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon";  Description: "Create a &desktop shortcut"; GroupDescription: "Shortcuts:"
Name: "startupicon";  Description: "Start {#MyAppShort} when I sign in to Windows"; GroupDescription: "Options:"; Flags: unchecked

[Files]
; Everything electron-builder produced (app, resources\bin = the full llama.cpp runtime, resources\web, ...).
Source: "{#BuildDir}\*"; DestDir: "{app}"; Excludes: "*.gguf"; Flags: ignoreversion recursesubdirs createallsubdirs
#if BundledModel
; The model is stored as-is (already compressed).
Source: "{#BuildDir}\resources\models\{#ModelFile}"; DestDir: "{app}\resources\models"; Flags: ignoreversion nocompression
#endif

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}";  Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "NarrativeIntegrityEngine"; ValueData: """{app}\{#MyAppExeName}"""; Tasks: startupicon; Flags: uninsdeletevalue

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; A model downloaded by setup is not tracked by the uninstaller, so remove it explicitly.
Type: filesandordirs; Name: "{app}\resources\models"

#if !BundledModel
[Code]
{ No bundled model: download it as part of installation (resumable verification happens in the app on first launch too). }
var
  ModelPage: TDownloadWizardPage;

procedure InitializeWizard;
begin
  ModelPage := CreateDownloadPage('Offline NIE', 'Downloading the offline model (about 1.9 GB)...', nil);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if CurPageID = wpReady then
  begin
    ModelPage.Clear;
    ModelPage.Add('{#ModelUrl}', '{#ModelFile}', '');
    ModelPage.Show;
    try
      try
        ModelPage.Download;
      except
        { Do not block installation: NIE finishes the download itself on first launch and says so while it does. }
        SuppressibleMsgBox('The offline model could not be downloaded now. {#MyAppShort} will finish downloading it the first time it starts.' + #13#10#13#10 + GetExceptionMessage, mbInformation, MB_OK, IDOK);
      end;
    finally
      ModelPage.Hide;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  Src, DestDir: String;
begin
  if CurStep = ssPostInstall then
  begin
    Src := ExpandConstant('{tmp}\{#ModelFile}');
    DestDir := ExpandConstant('{app}\resources\models');
    if FileExists(Src) then
    begin
      ForceDirectories(DestDir);
      FileCopy(Src, DestDir + '\{#ModelFile}', False);
    end;
  end;
end;
#endif
