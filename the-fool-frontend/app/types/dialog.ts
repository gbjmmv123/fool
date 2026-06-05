export type DialogType =
  | 'name'
  | 'welcome'
  | 'alert'
  | 'confirm'
  | 'share'
  | 'avatar-crop'
  | 'badge-wechat-save'
  | 'staff-password'
  | 'error-modal'

export interface DialogState<TResult = unknown> {
  key: string
  type: DialogType
  payload: Record<string, unknown>
  resolve: (value: TResult) => void
  blocking: boolean
}

export interface NameInputResult { nickname: string }
export type ConfirmResult = 'confirm' | 'cancel'
export interface AvatarCropResult { dataUrl: string }

export interface BadgeSaveDialogPayload {
  status: 'loading' | 'ready' | 'error'
  imageDataUrl?: string
  fileName?: string
  isWechat: boolean
  renderTimeMs?: number
  downloadTimeMs?: number
  message?: string
}
