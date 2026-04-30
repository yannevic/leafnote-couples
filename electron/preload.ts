import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data?: unknown) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  },
  invoke: (channel: string, data?: unknown) => {
    return ipcRenderer.invoke(channel, data)
  },
  winMinimize: () => ipcRenderer.send('win-minimize'),
  winMaximize: () => ipcRenderer.send('win-maximize'),
  winClose: () => ipcRenderer.send('win-close'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // ─── Updater ────────────────────────────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateChecking: (cb: () => void) => ipcRenderer.on('update-checking', () => cb()),
  onUpdateAvailable: (cb: (info: unknown) => void) =>
    ipcRenderer.on('update-available', (_e, info) => cb(info)),
  onUpdateNotAvailable: (cb: () => void) => ipcRenderer.on('update-not-available', () => cb()),
  onUpdateProgress: (cb: (progress: unknown) => void) =>
    ipcRenderer.on('update-progress', (_e, progress) => cb(progress)),
  onUpdateDownloaded: (cb: (info: unknown) => void) =>
    ipcRenderer.on('update-downloaded', (_e, info) => cb(info)),
  onUpdateError: (cb: (msg: string) => void) =>
    ipcRenderer.on('update-error', (_e, msg) => cb(msg)),
})
