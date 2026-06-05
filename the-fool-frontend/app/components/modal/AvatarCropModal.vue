<script setup lang="ts">
import { MODAL } from '~/data/copy'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()

const file = computed(() => props.payload.file as File)
const objectUrl = ref<string>('')
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

onMounted(() => {
  objectUrl.value = URL.createObjectURL(file.value)
})

onBeforeUnmount(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

function cancel() {
  closeDialog(props.dialogKey, null)
}

function confirm() {
  const cropper = cropperRef.value
  if (!cropper) {
    cancel()
    return
  }
  const result = cropper.getResult()
  if (!result?.canvas) {
    cancel()
    return
  }
  const dataUrl = result.canvas.toDataURL('image/png')
  closeDialog(props.dialogKey, { dataUrl })
}
</script>

<template>
  <ModalDialog
    :title="MODAL.avatarCropTitle"
    :blocking="false"
    :show-close="true"
    @close="cancel"
  >
    <ClientOnly>
      <div class="avatar-crop">
        <Cropper
          ref="cropperRef"
          class="avatar-crop__cropper"
          :src="objectUrl"
          :stencil-component="CircleStencil"
          :stencil-props="{ aspectRatio: 1 }"
          image-restriction="fit-area"
        />
        <p class="avatar-crop__tip">{{ MODAL.avatarCropTip }}</p>
      </div>
    </ClientOnly>

    <template #footer>
      <button class="btn" type="button" @click="cancel">{{ MODAL.avatarCropCancel }}</button>
      <button class="btn btn--primary" type="button" @click="confirm">{{ MODAL.avatarCropConfirm }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.avatar-crop {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.avatar-crop__cropper {
  width: 100%;
  height: min(60vh, 400px);
  background: #000;
  border-radius: 12px;
}

.avatar-crop__tip {
  margin: 0;
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  text-align: center;
}

.btn--primary {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-border-default);
  color: var(--dt-border-default);
}

:deep(.modal-dialog__card) {
  max-width: 480px;
}
</style>
