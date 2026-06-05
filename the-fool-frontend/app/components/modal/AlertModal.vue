<script setup lang="ts">
const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
import { COMMON, MODAL } from '~/data/copy'
const title = computed(() => (props.payload.title as string | undefined) ?? MODAL.alertDefaultTitle)
const message = computed(() => props.payload.message as string)

function close() {
  closeDialog(props.dialogKey)
}
</script>

<template>
  <ModalDialog
    :title="title"
    :blocking="props.blocking"
    :mask-closable="!props.blocking"
    :close-on-esc="!props.blocking"
    @close="close"
  >
    <p class="alert-message">{{ message }}</p>
    <template #footer>
      <button class="btn" type="button" @click="close">{{ COMMON.ok }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.alert-message {
  margin: 0;
  line-height: 1.7;
  color: var(--dt-text-secondary);
}
</style>
