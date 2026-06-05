<script setup lang="ts">
import { COMMON, MODAL } from '~/data/copy'
const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const message = computed(() => props.payload.message as string)

function close() {
  closeDialog(props.dialogKey)
}
</script>

<template>
  <ModalDialog
    :title="MODAL.welcomeTitle"
    :blocking="props.blocking"
    :mask-closable="!props.blocking"
    :close-on-esc="!props.blocking"
    @close="close"
  >
    <p class="welcome-message">{{ message }}</p>
    <template #footer>
      <button class="btn" type="button" @click="close">{{ COMMON.gotIt }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.welcome-message {
  margin: 0;
  line-height: 1.7;
  color: var(--dt-text-secondary);
}
</style>
