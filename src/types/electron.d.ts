interface Window {
  api: {
    send: (channel: string, data?: unknown) => void
    on: (channel: string, callback: (...args: unknown[]) => void) => void
    invoke: (channel: string, data?: unknown) => Promise<unknown>
    winMinimize: () => void
    winMaximize: () => void
    winClose: () => void
    getVersion: () => Promise<string>
  }
}
