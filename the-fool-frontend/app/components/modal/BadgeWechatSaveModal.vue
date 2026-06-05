<script setup lang="ts">
import type { BadgeSaveDialogPayload } from '~/types/dialog'
import { COMMON, MODAL } from '~/data/copy'

const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const state = computed(() => props.payload as BadgeSaveDialogPayload)
const imgSrc = computed(() => state.value.imageDataUrl ?? '')
const isLoading = computed(() => state.value.status === 'loading')
const isError = computed(() => state.value.status === 'error')
const isWechatMode = computed(() => state.value.isWechat)
const isMobileViewport = useMediaQuery('(max-width: 767px)')
const canDownload = computed(() => !isWechatMode.value && state.value.status === 'ready' && !!imgSrc.value)
const showFooter = computed(() => !isMobileViewport.value && !isLoading.value)
const saveTip = computed(() => isMobileViewport.value ? MODAL.badgeSaveTip : MODAL.badgeSaveDesktopTip)

function close() {
  closeDialog(props.dialogKey)
}

function refreshPage() {
  window.location.reload()
}

function downloadAgain() {
  if (!imgSrc.value || !state.value.fileName) return
  const a = document.createElement('a')
  a.href = imgSrc.value
  a.download = state.value.fileName
  a.click()
}
</script>

<template>
  <ModalDialog
    :title="MODAL.badgeSaveTitle"
    :blocking="false"
    :show-close="true"
    @close="close"
  >
    <div class="wx-save">
      <template v-if="isLoading">
        <div class="wx-save__loading" aria-hidden="true" />
        <p class="wx-save__tip">{{ MODAL.badgeSaveRendering }}</p>
      </template>

      <template v-else-if="isError">
        <button class="btn btn--primary wx-save__refresh" type="button" @click="refreshPage">
          {{ COMMON.refresh }}
        </button>
      </template>

      <template v-else>
        <p class="wx-save__tip">{{ saveTip }}</p>
        <div class="wx-save__image-wrap">
          <img :src="imgSrc" :alt="MODAL.badgeCardAriaLabel" class="wx-save__image">
        </div>
      </template>
    </div>
    <template v-if="showFooter" #footer>
      <div class="wx-save__footer">
        <button v-if="canDownload" class="btn btn--primary" type="button" @click="downloadAgain">
          {{ MODAL.badgeSaveDownloadAgain }}
        </button>
        <button class="btn" type="button" @click="close">{{ MODAL.badgeSaveDone }}</button>
      </div>
    </template>
  </ModalDialog>
</template>

<style scoped>
.wx-save {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 18rem;
  justify-content: center;
}

.wx-save__tip {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dt-text-body);
  text-align: center;
}

.wx-save__loading {
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid rgba(212, 184, 134, 0.18);
  border-top-color: var(--dt-border-default);
  animation: badge-save-spin 0.85s linear infinite;
}

.wx-save__image-wrap {
  display: grid;
  place-items: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 0.75rem;
}

.wx-save__image {
  display: block;
  width: 100%;
  max-width: 240px;
  height: auto;
  user-select: none;
  -webkit-user-select: none;
}

.wx-save__refresh {
  align-self: center;
}

.wx-save__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

:deep(.modal-dialog__card) {
  max-width: 360px;
}

@media (max-width: 767px) {
  .wx-save {
    min-height: auto;
  }

  .wx-save__image-wrap {
    padding: 0.875rem;
  }
}

@keyframes badge-save-spin {
  to { transform: rotate(360deg); }
}
</style>
