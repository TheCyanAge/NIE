import fs from 'node:fs';

/**
 * Auto-update wrapper with honest status.
 * Placeholders in updater-config.json mean "not configured": the UI is told so, and nothing pretends to check.
 * To go live: set owner/repo, publish releases with electron-builder, and sign the build (docs/WINDOWS_SIGNING.md).
 */

const PLACEHOLDER = /^(?:|YOUR[_-].*|OWNER|REPO|example|todo|changeme)$/i;

export function readUpdaterConfig(file) {
  try {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { provider: c.provider ?? 'github', owner: String(c.owner ?? ''), repo: String(c.repo ?? '') };
  } catch {
    return { provider: 'github', owner: '', repo: '' };
  }
}

export function isConfigured(config) {
  return config.provider === 'github' && !PLACEHOLDER.test(config.owner.trim()) && !PLACEHOLDER.test(config.repo.trim());
}

export function createUpdater({ isPackaged, config, loadAutoUpdater, onStatus = () => {}, currentVersion = '0.0.0', portable = false }) {
  let status = { state: 'idle', message: '', version: null, progress: null, currentVersion };
  let au = null;
  const set = (patch) => {
    status = { ...status, ...patch };
    onStatus(status);
  };

  const unavailableReason = !isPackaged
    ? 'Updates only work in the installed app, not in a development build.'
    : portable
      ? "This is the portable copy: it doesn't update itself. Download the newest file from NIE's Releases page when you want a newer version."
      : !isConfigured(config)
      ? "Updates aren't configured for this build yet. (Set the GitHub owner and repository in updater-config.json and publish releases.)"
      : null;
  if (unavailableReason) status = { ...status, state: 'unconfigured', message: unavailableReason };

  async function ensure() {
    if (au) return au;
    au = await loadAutoUpdater();
    au.autoDownload = true;
    au.autoInstallOnAppQuit = true;
    au.setFeedURL?.({ provider: config.provider, owner: config.owner, repo: config.repo });
    au.on('checking-for-update', () => set({ state: 'checking', message: 'Checking for updates…' }));
    au.on('update-available', (i) => set({ state: 'available', version: i?.version ?? null, message: `Version ${i?.version ?? ''} is available. Downloading…` }));
    au.on('update-not-available', () => set({ state: 'not-available', message: 'You have the latest version.' }));
    au.on('download-progress', (p) => set({ state: 'downloading', progress: Math.round(p?.percent ?? 0), message: `Downloading update… ${Math.round(p?.percent ?? 0)}%` }));
    au.on('update-downloaded', (i) => set({ state: 'downloaded', version: i?.version ?? status.version, progress: 100, message: 'Update ready. Restart to install.' }));
    au.on('error', (e) => set({ state: 'error', message: `Update check failed: ${e?.message ?? e}` }));
    return au;
  }

  return {
    status: () => status,
    async check() {
      if (unavailableReason) return status;
      try {
        await (await ensure()).checkForUpdates();
      } catch (e) {
        set({ state: 'error', message: `Update check failed: ${e?.message ?? e}` });
      }
      return status;
    },
    install() {
      if (status.state !== 'downloaded' || !au) return { ok: false, message: 'No downloaded update to install.' };
      au.quitAndInstall(false, true);
      return { ok: true };
    },
  };
}
