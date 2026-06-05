<script setup lang="ts">
import { COMMON, MODAL } from '~/data/copy'
const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const { tryUnlock } = useStaffAuth()
const password = ref('')
const error = ref('')
const shaking = ref(false)

function submit() {
  if (!password.value.trim()) {
    error.value = MODAL.staffPasswordEmpty
    return
  }
  if (tryUnlock(password.value)) {
    closeDialog(props.dialogKey, true)
  } else {
    error.value = MODAL.staffPasswordWrong
    password.value = ''
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 400)
  }
}

function dismiss() {
  closeDialog(props.dialogKey, false)
}
</script>

<template>
  <ModalDialog
    :title="MODAL.staffPasswordTitle"
    :blocking="false"
    :mask-closable="true"
    :close-on-esc="true"
    @close="dismiss"
  >
    <input
      v-model="password"
      type="password"
      class="pw-input"
      :class="{ 'pw-input--shake': shaking }"
      :placeholder="MODAL.staffPasswordPlaceholder"
      autocomplete="off"
      @keydown.enter="submit"
    />
    <p v-if="error" class="pw-input__error">{{ error }}</p>
    <template #footer>
      <button class="btn btn--primary" type="button" @click="submit">{{ COMMON.confirm }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.pw-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--dt-border-default);
  border-radius: 8px;
  color: var(--dt-text-base);
  font: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.pw-input:focus {
  border-color: var(--dt-border-active);
}

.pw-input--shake {
  animation: shake 0.4s ease;
  border-color: var(--dt-danger);
}

.pw-input__error {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--dt-danger);
}

.btn--primary {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-primary);
  color: var(--dt-primary);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
</style>
