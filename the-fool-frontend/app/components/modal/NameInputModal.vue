<script setup lang="ts">
import { COMMON, MODAL } from '~/data/copy'
import { t } from '~/data/copy'
const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const { showMessage } = useMessage()
const nickname = ref('')
const error = ref('')
const MAX_LEN = 12
const charCount = computed(() => nickname.value.length)

function submit() {
  const trimmed = nickname.value.trim()
  if (!trimmed) { error.value = MODAL.nameInputPlaceholder; return }
  if (trimmed.length > MAX_LEN) { error.value = t('昵称最多 {n} 个字符', { n: MAX_LEN }); return }
  showMessage({ text: t('等待你很久了！{name}', { name: trimmed }), color: '#d4b886' })
  closeDialog(props.dialogKey, { nickname: trimmed })
}

function dismiss() {
  closeDialog(props.dialogKey, null)
}
</script>

<template>
  <ModalDialog
    :title="MODAL.nameInputTitle"
    :blocking="props.blocking"
    :mask-closable="!props.blocking"
    :close-on-esc="!props.blocking"
    @close="dismiss"
  >
    <div class="name-input-wrapper">
      <input
        v-model="nickname"
        type="text"
        class="name-input"
        :placeholder="MODAL.nameInputPlaceholder"
        @keydown.enter="submit"
      />
      <span
        class="name-input__counter"
        :class="{ 'name-input__counter--over': charCount > MAX_LEN }"
      >{{ charCount }}/{{ MAX_LEN }}</span
      >
    </div>
    <p v-if="error" class="name-input__error">{{ error }}</p>
    <template #footer>
      <button
        class="btn btn--primary"
        :class="{ 'btn--disabled': charCount > MAX_LEN }"
        :disabled="charCount > MAX_LEN"
        type="button"
        @click="submit"
      >{{ COMMON.confirm }}</button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.name-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 1rem;
}

.name-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  padding-right: 3.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--dt-border-default);
  border-radius: 8px;
  color: var(--dt-text-body);
  font: inherit;
  font-size: 1rem;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.name-input::placeholder {
  display: inline-block;
  color: var(--dt-text-muted);
  line-height: inherit;
  transform: translateY(1px);
}

.name-input:focus {
  border-color: var(--dt-border-active);
}

.name-input__counter {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  pointer-events: none;
  user-select: none;
}

.name-input__counter--over {
  color: var(--dt-state-danger);
}

.name-input__error {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--dt-state-danger);
}

.btn--primary {
  background: transparent;
  padding: 0.3rem 1rem; 
  border-color: var(--dt-border-default);
  color: var(--dt-text-body);
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.btn--disabled,
.btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

:deep(.modal-dialog__card) {
  width: 640px;
  aspect-ratio: 2560 / 1900;
  height: auto;
  max-width: calc(100vw - 3rem);
  padding: clamp(2.4rem, 5vw, 3rem) clamp(1.75rem, 4vw, 2.4rem) clamp(1.4rem, 3vw, 1.9rem);
  display: flex;
  flex-direction: column;
  border: 0;
  border-radius: 0;
  background-color: var(--dt-bg-base);
  background-image: url('/static/border/name.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  box-shadow: none;
  box-sizing: border-box;
  overflow: hidden;
}

:deep(.modal-dialog__body) {
  margin-top: clamp(1.25rem, 3vw, 1.75rem);
}

:deep(.modal-dialog__footer) {
  margin-top: auto;
  padding-top: clamp(1rem, 3vw, 1.5rem);
}
</style>
