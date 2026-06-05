<script setup lang="ts">
import { MODAL } from '~/data/copy'
const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const imgSrc = computed(() => props.payload.imageDataUrl as string)

function close() {
  closeDialog(props.dialogKey)
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
      <p class="wx-save__tip">{{ MODAL.badgeSaveTip }}</p>
      <div class="wx-save__image-wrap">
        <img :src="imgSrc" :alt="MODAL.badgeCardAriaLabel" class="wx-save__image">
      </div>
    </div>
    <template #footer>
      <button class="btn" type="button" @click="close">{{ MODAL.badgeSaveDone }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.wx-save {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wx-save__tip {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dt-text-body);
  text-align: center;
}

.wx-save__image-wrap {
  display: grid;
  place-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 0.5rem;
}

.wx-save__image {
  display: block;
  width: 100%;
  max-width: 240px;
  height: auto;
  user-select: none;
  -webkit-user-select: none;
}

:deep(.modal-dialog__card) {
  max-width: 360px;
}
</style>
