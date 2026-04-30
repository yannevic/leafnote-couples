interface Window {
  api: {
    send: (channel: string, data?: unknown) => void
    on: (channel: string, callback: (...args: unknown[]) => void) => void
    invoke: (channel: string, data?: unknown) => Promise<unknown>
    winMinimize: () => void
    winMaximize: () => void
    winClose: () => void
    getVersion: () => Promise<string>
    checkForUpdates: () => Promise<unknown>
    installUpdate: () => Promise<void>
    onUpdateChecking: (cb: () => void) => void
    onUpdateAvailable: (cb: (info: unknown) => void) => void
    onUpdateNotAvailable: (cb: () => void) => void
    onUpdateProgress: (cb: (progress: { percent: number }) => void) => void
    onUpdateDownloaded: (cb: (info: unknown) => void) => void
    onUpdateError: (cb: (msg: string) => void) => void
  }
}
