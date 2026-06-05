import { reactive, ref, readonly } from 'vue'
import { BADGE_COPY } from '~/data/copy'
import { isWechat } from '~/utils/env'
import { renderBadgeImage } from '~/services/badge'

export interface BadgeConfig {
  name: string
  role: string
  idText: string
  themeColor: string
}

export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  name: BADGE_COPY.defaultName ?? '周明瑞',
  role: BADGE_COPY.defaultRole ?? '硬件工程师',
  idText: 'ID:13270304',
  themeColor: '#f07010',
}

// BADGE_STATIC now references centralized BADGE_COPY from ~/data/copy.ts
export { BADGE_COPY as BADGE_STATIC } from '~/data/copy'

export const DEFAULT_AVATAR_URL = '/static/avatars/artist-zhou.png'

export function useBadgeConfig() {
  const config = reactive<BadgeConfig>({ ...DEFAULT_BADGE_CONFIG })
  const avatarUrl = ref<string>(DEFAULT_AVATAR_URL)
  const exporting = ref(false)
  const { openAvatarCropDialog, openBadgeWechatSaveDialog, openAlertDialog, updateDialog } = useDialog()

  function reset() {
    Object.assign(config, DEFAULT_BADGE_CONFIG)
    avatarUrl.value = DEFAULT_AVATAR_URL
  }

  async function pickAndCropAvatar(file: File) {
    if (!file.type.startsWith('image/')) {
      await openAlertDialog({ message: BADGE_COPY.formInvalidFile ?? '请上传图片文件。' })
      return
    }
    const result = await openAvatarCropDialog(file)
    if (result?.dataUrl) avatarUrl.value = result.dataUrl
  }

  function applyDefaultAvatar() {
    avatarUrl.value = DEFAULT_AVATAR_URL
  }

  function applyAvatarUrl(url: string) {
    avatarUrl.value = url
  }

  async function exportBadge() {
    if (exporting.value) return
    exporting.value = true
    const dialogKey = openBadgeWechatSaveDialog({
      status: 'loading',
      isWechat: isWechat(),
    })
    try {
      const avatarDataUrl = await resolveAvatarDataUrl(avatarUrl.value)
      const { blob, renderTimeMs } = await renderBadgeImage({
        name: config.name,
        role: config.role,
        idText: config.idText,
        themeColor: normalizeThemeColor(config.themeColor),
        avatarDataUrl,
      })

      const imageDataUrl = await blobToDataUrl(blob)
      const fileName = `${(config.name || '工牌').trim()}-工牌.png`
      const downloadTimeMs = isWechat() ? 0 : downloadImage(imageDataUrl, fileName)

      updateDialog(dialogKey, {
        status: 'ready',
        imageDataUrl,
        fileName,
        renderTimeMs,
        downloadTimeMs,
      })
    } catch (err) {
      console.error('保存工牌失败', err)
      updateDialog(dialogKey, {
        status: 'error',
        message: BADGE_COPY.formSaveFailed,
      })
      await openAlertDialog({ message: BADGE_COPY.formSaveFailed })
    } finally {
      exporting.value = false
    }
  }

  return {
    config,
    avatarUrl: readonly(avatarUrl),
    exporting: readonly(exporting),
    reset,
    pickAndCropAvatar,
    applyDefaultAvatar,
    applyAvatarUrl,
    exportBadge,
  }
}

function downloadImage(href: string, fileName: string) {
  const startedAt = performance.now()
  const a = document.createElement('a')
  a.href = href
  a.download = fileName
  a.click()
  return performance.now() - startedAt
}

async function resolveAvatarDataUrl(value: string) {
  if (value.startsWith('data:image/')) return value
  const response = await fetch(value)
  if (!response.ok) throw new Error(`avatar_fetch_failed:${response.status}`)
  return blobToDataUrl(await response.blob())
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('file_reader_failed'))
    reader.readAsDataURL(blob)
  })
}

function normalizeThemeColor(value: string) {
  const trimmed = value.trim()
  return /^#[\da-fA-F]{6}$/.test(trimmed) ? trimmed : DEFAULT_BADGE_CONFIG.themeColor
}
