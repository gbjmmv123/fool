import type {
  DialogState,
  DialogType,
  NameInputResult,
  ConfirmResult,
  AvatarCropResult,
  BadgeSaveDialogPayload,
} from '~/types/dialog'
import type { ExamResultResponse } from '~/types/result'

export function useDialog() {
  const dialogs = useState<DialogState[]>('church-dialogs', () => [])

  function pushDialog<T>(opts: { type: DialogType; payload: Record<string, unknown>; blocking: boolean; key?: string }): Promise<T> {
    return new Promise<T>((resolve) => {
      const key = opts.key ?? `${opts.type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      dialogs.value = [...dialogs.value, { ...opts, key, resolve: resolve as (v: unknown) => void } as DialogState]
    })
  }

  function closeDialog(key: string, value?: unknown) {
    const target = dialogs.value.find(d => d.key === key)
    target?.resolve(value)
    dialogs.value = dialogs.value.filter(d => d.key !== key)
  }

  function updateDialog(key: string, payload: Record<string, unknown>) {
    dialogs.value = dialogs.value.map(dialog =>
      dialog.key === key
        ? { ...dialog, payload: { ...dialog.payload, ...payload } }
        : dialog,
    )
  }

  function openNameInputDialog() {
    return pushDialog<NameInputResult | null>({ type: 'name', payload: {}, blocking: true })
  }

  function openWelcomeDialog(message: string) {
    return pushDialog<void>({ type: 'welcome', payload: { message }, blocking: false })
  }

  function openAlertDialog(options: { title?: string; message: string }) {
    return pushDialog<void>({ type: 'alert', payload: options, blocking: false })
  }

  function openConfirmDialog(options: { title: string; message: string; confirmText?: string; cancelText?: string }) {
    return pushDialog<ConfirmResult>({ type: 'confirm', payload: options, blocking: false })
  }

  function openShareCardDialog(data: ExamResultResponse) {
    return pushDialog<void>({ type: 'share', payload: { data }, blocking: false })
  }

  function openAvatarCropDialog(file: File) {
    return pushDialog<AvatarCropResult | null>({ type: 'avatar-crop', payload: { file }, blocking: false })
  }

  function openBadgeWechatSaveDialog(payload: BadgeSaveDialogPayload) {
    const key = `badge-wechat-save_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    dialogs.value = [
      ...dialogs.value,
      {
        key,
        type: 'badge-wechat-save',
        payload,
        blocking: false,
        resolve: () => {},
      },
    ]
    return key
  }

  function openStaffPasswordDialog() {
    return pushDialog<boolean>({ type: 'staff-password', payload: {}, blocking: false })
  }

  function openErrorModal() {
    return pushDialog<void>({ type: 'error-modal', payload: {}, blocking: false })
  }

  return {
    dialogs,
    closeDialog,
    updateDialog,
    openNameInputDialog,
    openWelcomeDialog,
    openAlertDialog,
    openConfirmDialog,
    openShareCardDialog,
    openAvatarCropDialog,
    openBadgeWechatSaveDialog,
    openStaffPasswordDialog,
    openErrorModal,
  }
}
