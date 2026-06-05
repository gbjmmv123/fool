<script setup lang="ts">
import type { ConfirmResult } from '~/types/dialog'
import { MODAL } from '~/data/copy'

const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const title = computed(() => props.payload.title as string)
const message = computed(() => props.payload.message as string)
const confirmText = computed(() => (props.payload.confirmText as string | undefined) ?? MODAL.confirmDefault)
const cancelText = computed(() => (props.payload.cancelText as string | undefined) ?? MODAL.cancelDefault)

function resolve(result: ConfirmResult) {
  closeDialog(props.dialogKey, result)
}
</script>

<template>
  <ModalDialog
    :title="title"
    :blocking="props.blocking"
    :mask-closable="!props.blocking"
    :close-on-esc="!props.blocking"
    @close="resolve('cancel')"
  >
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <button class="btn" type="button" @click="resolve('cancel')">{{ cancelText }}</button>
      <button class="btn btn--primary" type="button" @click="resolve('confirm')">{{ confirmText }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.confirm-message {
  margin: 0;
  line-height: 1.7;
  color: var(--dt-text-secondary);
}

.btn--primary {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-primary);
  color: var(--dt-primary);
}
</style>
