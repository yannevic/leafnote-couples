import { useEffect } from 'react'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'up-to-date'
  | 'error'

interface Props {
  onStatus: (status: UpdateStatus) => void
  onProgress: (percent: number) => void
  onError: (msg: string) => void
}

export default function UpdateNotifier({ onStatus, onProgress, onError }: Props) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (window as any).api

    api.onUpdateChecking(() => onStatus('checking'))
    api.onUpdateAvailable(() => onStatus('available'))
    api.onUpdateNotAvailable(() => onStatus('up-to-date'))
    api.onUpdateProgress((p: { percent: number }) => {
      onStatus('downloading')
      onProgress(Math.round(p.percent))
    })
    api.onUpdateDownloaded(() => onStatus('downloaded'))
    api.onUpdateError((msg: string) => {
      onStatus('error')
      onError(msg)
    })

    const interval = setInterval(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).api.checkForUpdates()
      },
      60 * 60 * 1000
    )

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
