<script setup lang="ts">
import type { ExamResultResponse } from '~/types/result'
import { getDepartmentData } from '~/data/departments'
import { RESULT, t } from '~/data/copy'
import { renderShareCardImage } from '~/services/share'

const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const SHARE_QR_IMAGE_URL = new URL('../../static/qr.png', import.meta.url).href

const data = computed(() => props.payload.data as ExamResultResponse)
const dept = computed(() => getDepartmentData(data.value.assignedDepartmentId))
const deptTitle = computed(() => {
  if (!dept.value) return ''
  return dept.value.name + (dept.value.officer.gender === 'female' ? '女士' : '先生')
})

const formattedTime = computed(() => {
  const d = new Date(data.value.detail.joinedAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

const status = ref<'loading' | 'ready' | 'error'>('loading')
const imageDataUrl = ref('')
const errorMessage = ref('')

const isLoading = computed(() => status.value === 'loading')
const isError = computed(() => status.value === 'error')
const readyTip = computed(() => RESULT.shareLongPressTip)

function close() {
  closeDialog(props.dialogKey)
}

onMounted(() => {
  void generateShareCard()
})

async function generateShareCard() {
  if (!dept.value) {
    errorMessage.value = 'missing_department_data'
    status.value = 'error'
    return
  }

  status.value = 'loading'
  errorMessage.value = ''
  try {
    const backgroundDataUrl = await resolveImageDataUrl(dept.value.shareImage)
    const qrDataUrl = await resolveImageDataUrl(SHARE_QR_IMAGE_URL)
    const { blob } = await renderShareCardImage({
      themeColor: dept.value.themeColor,
      backgroundDataUrl,
      qrDataUrl,
      joinedAtText: t(RESULT.shareJoinedAt, { time: formattedTime.value }),
      deptTitleText: t(RESULT.shareDeptLabel, { dept: deptTitle.value }),
      qrLabelText: RESULT.shareQrLabel,
    })
    imageDataUrl.value = await blobToDataUrl(blob)
    status.value = 'ready'
  } catch (error) {
    console.error('保存分享图失败', error)
    errorMessage.value = error instanceof Error ? error.message : String(error)
    status.value = 'error'
  }
}

async function resolveImageDataUrl(path: string) {
  if (path.startsWith('data:image/')) return path
  const url = path.startsWith('http') ? path : new URL(path, window.location.origin).toString()
  const response = await fetch(url)
  if (!response.ok) throw new Error(`share_asset_fetch_failed:${response.status}:${url}`)
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    throw new Error(`share_asset_invalid_type:${contentType || 'unknown'}:${url}`)
  }
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
</script>

<template>
  <ModalDialog
    :title="RESULT.shareTitle"
    :blocking="false"
    :show-close="true"
    @close="close"
  >
    <div class="share-modal">
      <template v-if="isLoading">
        <div class="share-modal__loading" aria-hidden="true" />
        <p class="share-modal__tip">{{ RESULT.shareGenerating }}</p>
      </template>

      <template v-else-if="isError">
        <p class="share-modal__error">{{ errorMessage || RESULT.shareFailed }}</p>
        <button class="btn btn--primary share-modal__retry" type="button" @click="generateShareCard">
          {{ RESULT.retryBtn }}
        </button>
      </template>

      <template v-else>
        <p class="share-modal__tip">{{ readyTip }}</p>
        <div class="share-modal__image-wrap">
          <img :src="imageDataUrl" :alt="RESULT.shareTitle" class="share-modal__image">
        </div>
      </template>
    </div>
  </ModalDialog>
</template>

<style scoped>
.share-modal {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 20rem;
  justify-content: center;
}

:deep(.modal-dialog__card) {
  max-width: 420px;
}

.share-modal__tip {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dt-text-body);
  text-align: center;
}

.share-modal__loading {
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid rgba(212, 184, 134, 0.18);
  border-top-color: var(--dt-border-default);
  animation: share-card-spin 0.85s linear infinite;
}

.share-modal__image-wrap {
  display: grid;
  place-items: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 0.75rem;
}

.share-modal__image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.share-modal__retry {
  align-self: center;
}

.share-modal__error {
  margin: 0;
  color: #b42318;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.5;
  word-break: break-word;
}

@media (max-width: 767px) {
  .share-modal {
    min-height: auto;
  }

  .share-modal__image-wrap {
    padding: 0.875rem;
  }
}

@keyframes share-card-spin {
  to { transform: rotate(360deg); }
}
</style>
