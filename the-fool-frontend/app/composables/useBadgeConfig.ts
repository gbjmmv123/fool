import { reactive, ref, readonly, nextTick } from 'vue'
import { BADGE_COPY } from '~/data/copy'
import { isWechat } from '~/utils/env'

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

export const EXPORT_WIDTH_PX = 1252
export const EXPORT_HEIGHT_PX = 2159

export function useBadgeConfig() {
  const config = reactive<BadgeConfig>({ ...DEFAULT_BADGE_CONFIG })
  const avatarUrl = ref<string>(DEFAULT_AVATAR_URL)
  const exporting = ref(false)
  const { openAvatarCropDialog, openBadgeWechatSaveDialog, openAlertDialog } = useDialog()

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

  async function exportBadge(frame: HTMLElement) {
    if (exporting.value) return
    exporting.value = true
    try {
      const { toCanvas } = await import('html-to-image')

      await nextTick()
      const { node, cleanup } = prepareExportNode(frame)

      try {
        await waitForImagesIn(node)

        const canvas = await toCanvas(node, {
          cacheBust: true,
          backgroundColor: 'transparent',
          pixelRatio: 1,
          canvasWidth: EXPORT_WIDTH_PX,
          canvasHeight: EXPORT_HEIGHT_PX,
        })

        const fileName = `${(config.name || '工牌').trim()}-工牌.png`

        if (isWechat()) {
          const dataUrl = canvas.toDataURL('image/png')
          exporting.value = false
          await openBadgeWechatSaveDialog(dataUrl)
        } else {
          const blob: Blob | null = await new Promise(resolve =>
            canvas.toBlob(resolve, 'image/png'),
          )
          if (blob) {
            const url = URL.createObjectURL(blob)
            triggerDownload(url, fileName)
            URL.revokeObjectURL(url)
          } else {
            triggerDownload(canvas.toDataURL('image/png'), fileName)
          }
        }
      } finally {
        cleanup()
      }
    } catch (err) {
      console.error('保存工牌失败', err)
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

function triggerDownload(href: string, fileName: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = fileName
  a.click()
}

function waitForImagesIn(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll('img'))
  return Promise.all(imgs.map(img =>
    img.complete && img.naturalWidth > 0
      ? img.decode().catch(() => undefined)
      : new Promise<void>((res) => {
          img.addEventListener('load', () => {
            img.decode().catch(() => undefined).finally(() => res())
          }, { once: true })
          img.addEventListener('error', () => res(), { once: true })
        }),
  ))
}

function prepareExportNode(frame: HTMLElement) {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-99999px'
  host.style.top = '0'
  host.style.opacity = '1'
  host.style.pointerEvents = 'none'
  host.style.background = 'transparent'

  const clone = frame.cloneNode(true) as HTMLElement
  clone.classList.add('badge-export-clone')
  normalizeExportClone(frame, clone)
  host.appendChild(clone)
  document.body.appendChild(host)

  return {
    node: clone,
    cleanup: () => host.remove(),
  }
}

function normalizeExportClone(source: HTMLElement, clone: HTMLElement) {
  const cloneCards = Array.from(clone.querySelectorAll<HTMLElement>('.badge-card'))
  const sourceAvatarWraps = Array.from(source.querySelectorAll<HTMLElement>('.badge-avatar-wrap'))
  const cloneAvatarWraps = Array.from(clone.querySelectorAll<HTMLElement>('.badge-avatar-wrap'))
  const sourceAvatarPhotos = Array.from(source.querySelectorAll<HTMLElement>('.badge-avatar-photo'))
  const cloneAvatarPhotos = Array.from(clone.querySelectorAll<HTMLElement>('.badge-avatar-photo'))
  const cloneAvatars = Array.from(clone.querySelectorAll<HTMLElement>('.badge-avatar'))

  cloneCards.forEach((node) => {
    node.style.boxShadow = 'none'
  })

  cloneAvatarWraps.forEach((node, index) => {
    const sourceNode = sourceAvatarWraps[index]
    const sourceStyle = sourceNode ? getComputedStyle(sourceNode) : null

    node.classList.remove('badge-avatar-wrap')
    node.style.position = sourceStyle?.position ?? 'relative'
    node.style.zIndex = sourceStyle?.zIndex ?? '2'
    node.style.width = sourceStyle?.width ?? '188px'
    node.style.height = sourceStyle?.height ?? '188px'
    node.style.margin = sourceStyle?.margin ?? '16px auto 0'
    node.style.boxSizing = 'border-box'
    node.style.borderRadius = '50%'
    node.style.border = '1px solid rgba(240, 112, 16, 0.24)'
  })

  cloneAvatars.forEach((node) => {
    node.style.boxShadow = 'none'
    node.style.background = 'transparent'
  })

  cloneAvatarPhotos.forEach((node, index) => {
    const bg = sourceAvatarPhotos[index]
      ? getComputedStyle(sourceAvatarPhotos[index]).backgroundImage
      : node.style.backgroundImage
    const url = extractUrlFromBackgroundImage(bg)
    if (!url) return

    node.style.backgroundImage = 'none'
    node.style.position = 'relative'
    node.style.transform = 'none'

    const img = document.createElement('img')
    img.src = url
    img.alt = ''
    img.decoding = 'sync'
    img.draggable = false
    img.style.position = 'absolute'
    img.style.inset = '0'
    img.style.display = 'block'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'contain'
    img.style.objectPosition = 'center bottom'
    node.appendChild(img)
  })

  const sourceBands = Array.from(source.querySelectorAll<HTMLElement>('.badge-band'))
  const cloneBands = Array.from(clone.querySelectorAll<HTMLElement>('.badge-band'))

  cloneBands.forEach((node, index) => {
    const color = sourceBands[index]
      ? getComputedStyle(sourceBands[index]).backgroundColor
      : getComputedStyle(node).backgroundColor
    node.style.background = 'none'
    node.style.clipPath = 'none'
    node.style.webkitClipPath = 'none'
    node.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 276 88" preserveAspectRatio="none" style="display:block;width:100%;height:100%;color:${color}"><path d="M0 28.16 L276 0 V88 H0 Z" fill="currentColor"/></svg>`
  })
}

function extractUrlFromBackgroundImage(value: string) {
  const match = value.match(/^url\((['"]?)(.*)\1\)$/)
  return match?.[2] ?? ''
}
