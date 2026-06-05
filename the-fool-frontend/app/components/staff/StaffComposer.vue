<script setup lang="ts">
import { STAFF_COPY } from '~/data/copy'
const props = defineProps<{
  sending: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const content = ref('')

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

function submit() {
  const trimmed = content.value.trim()
  if (!trimmed || props.sending) return
  emit('send', trimmed)
  content.value = ''
}

function setDraft(draft: string) {
  content.value = draft
}

defineExpose({ setDraft })
</script>

<template>
  <div class="composer">
    <textarea
      v-model="content"
      class="composer__input"
      :placeholder="STAFF_COPY.composerPlaceholder"
      rows="12"
      :disabled="sending"
      @keydown="handleKeydown"
    />
    <div class="composer__footer">
      <span class="composer__hint">{{ STAFF_COPY.composerHint }}</span>
      <button
        class="composer__send"
        type="button"
        :disabled="sending || !content.trim()"
        @click="submit"
      >
        {{ sending ? STAFF_COPY.composerSending : STAFF_COPY.composerSend }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.composer {
  flex-shrink: 0;
  border-top: 1px solid var(--dt-border-subtle);
  background: rgba(18, 18, 18, 0.8);
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.composer__input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--dt-border-subtle);
  border-radius: 8px;
  color: var(--dt-text-body);
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.6rem 0.75rem;
  resize: none;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.composer__input:focus {
  border-color: var(--dt-border-default);
}

.composer__input:disabled {
  opacity: 0.5;
}

.composer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.composer__hint {
  font-size: 0.72rem;
  color: var(--dt-text-muted);
}

.composer__send {
  padding: 0.4rem 1.1rem;
  background: rgba(212, 184, 134, 0.15);
  border: 1px solid var(--dt-border-default);
  border-radius: 6px;
  color: var(--dt-text-title);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.composer__send:hover:not(:disabled) {
  background: rgba(212, 184, 134, 0.25);
}

.composer__send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
