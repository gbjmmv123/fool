export interface ToastItem {
  id: number
  text: string
  color?: string
  duration: number
  visible: boolean
}

interface ShowMessageOptions {
  text: string
  color?: string
  duration?: number
}

let nextId = 1

export function useMessage() {
  const toasts = useState<ToastItem[]>('church-toasts', () => [])

  function showMessage(text: string): void
  function showMessage(options: ShowMessageOptions): void
  function showMessage(arg: string | ShowMessageOptions) {
    const opts = typeof arg === 'string' ? { text: arg } : arg
    const id = nextId++
    const duration = opts.duration ?? 3000

    const item: ToastItem = {
      id,
      text: opts.text,
      color: opts.color,
      duration,
      visible: true,
    }

    toasts.value = [...toasts.value, item]

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showMessage, removeToast }
}
