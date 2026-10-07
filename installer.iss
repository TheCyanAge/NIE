; Narrative Integrity Engine: Inno Setup 6 installer.
;
; Build order (see docs/BUILDING.md):
;   npm install && npm run fetch:runtime && npm run icons && npm run build:desktop     -> dist-desktop\win-unpacked
;   iscc installer.iss                                                                 -> dist-installer\Narrative Integrity Engine Setup <version>.exe
;
; Compiled and tested by the windows-release and windows-package workflows on a real Windows runner.

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

[Code]
{ The offline model is NOT downloaded here. A second download inside the wizard (into a temp folder, then copied) could not
  resume, had no checksum, did not count its disk space, and was never exercised by the automatic tests, which install
  silently. The app itself does the one resumable, honest download on its first start, into the user's profile, shows its progress,
  and keeps working from its built-in library meanwhile. }

{ Uninstall keeps the writer's projects and, unless they say otherwise, the downloaded model. The model is about 1.9 GB and can
  be downloaded again, so offer to remove it; a silent uninstall keeps it (the default answer is No). }
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  ModelsDir: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    ModelsDir := ExpandConstant('{userappdata}\Narrative Integrity Engine\models');
    if DirExists(ModelsDir) then
      if SuppressibleMsgBox('Also remove the offline model that Narrative Integrity Engine downloaded (about 1.9 GB)?' + #13#10#13#10 + 'Your projects are kept either way, and the model can be downloaded again.', mbConfirmation, MB_YESNO or MB_DEFBUTTON2, IDNO) = IDYES then
        DelTree(ModelsDir, True, True, True);
  end;
end;
