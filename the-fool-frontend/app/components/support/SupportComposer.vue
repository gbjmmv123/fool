<script setup lang="ts">
const emit = defineEmits<{ (e: 'submit', value: string): void }>()
const props = defineProps<{
  disabled?: boolean
  thinking?: boolean
  dailyLimitReached?: boolean
  dailyRemaining?: number
}>()

const DRAFT_KEY = 'church_support_draft'
const MAX_LEN = 2000

const draft = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)

watch(draft, (value) => {
  if (!import.meta.client) return
  if (value) localStorage.setItem(DRAFT_KEY, value)
  else localStorage.removeItem(DRAFT_KEY)
})

const overLimit = computed(() => Array.from(draft.value).length >= MAX_LEN)
const isDisabled = computed(() => props.disabled || props.thinking || props.dailyLimitReached)

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(draft, () => nextTick(autoResize))

function submit() {
  const value = draft.value.trim()
  if (!value || isDisabled.value) return
  emit('submit', value)
  draft.value = ''
  nextTick(autoResize)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

function setDraft(text: string) {
  draft.value = text
  nextTick(() => {
    autoResize()
    inputRef.value?.focus()
  })
}

onMounted(() => {
  const saved = localStorage.getItem(DRAFT_KEY)
  if (saved) draft.value = saved.slice(0, MAX_LEN)
  nextTick(() => {
    inputRef.value?.focus()
    autoResize()
  })
})

defineExpose({ focus: () => inputRef.value?.focus(), setDraft })
</script>

<template>
  <div class="support-composer">
    <Transition name="support-warn">
      <div v-if="overLimit" class="support-warn" role="alert">
        太长了！你是不是想难为小镜子！
      </div>
    </Transition>
    <!-- 每日限额提示 -->
    <Transition name="support-warn">
      <div v-if="dailyLimitReached" class="support-limit" role="alert">
          伟大的崇高的主人要带我去梦境都市玩喽～ 拜拜～ 
      </div>
    </Transition>
    <div class="support-composer__row">
      <textarea
        ref="inputRef"
        v-model="draft"
        class="support-input"
        :placeholder="dailyLimitReached ? '今日次数已用完' : thinking ? '阿罗德斯正在镜中思考...' : `输入消息，回车发送 (今日剩余 ${dailyRemaining ?? 3} 次)`"
        rows="1"
        :maxlength="MAX_LEN"
        :disabled="isDisabled"
        @keydown="onKeydown"
        @input="autoResize"
      />
      <button
        type="button"
        class="support-send"
        :disabled="isDisabled || !draft.trim()"
        @click="submit"
      >
        <span v-if="isDisabled" class="support-send__spinner" aria-hidden="true" />
        <span v-else>发送</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.support-composer {
  display: flex;
  flex-direction: column;
  padding: 0.55rem 0.8rem 0.7rem;
  border-top: 1px solid color-mix(in srgb, var(--dt-mirror-edge) 30%, transparent);
  background: color-mix(in srgb, var(--dt-bg-elevated) 80%, transparent);
  flex-shrink: 0;
}

.support-warn {
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  color: var(--dt-state-danger);
  padding: 0.2rem 0.2rem 0.35rem;
  line-height: 1.3;
}

.support-limit {
  font-size: 0.76rem;
  letter-spacing: 0.05em;
  color: var(--dt-text-title);
  padding: 0.3rem 0.2rem 0.4rem;
  line-height: 1.55;
  text-align: center;
}

.support-warn-enter-active,
.support-warn-leave-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.22s ease;
  overflow: hidden;
}
.support-warn-enter-from,
.support-warn-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(4px);
}
.support-warn-enter-to,
.support-warn-leave-from {
  opacity: 1;
  max-height: 80px;
}

.support-composer__row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.support-input {
  flex: 1;
  resize: none;
  background: color-mix(in srgb, var(--dt-bg-base) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--dt-mirror-edge) 30%, transparent);
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  color: var(--dt-text-body);
  font-size: 0.88rem;
  font-family: inherit;
  line-height: 1.5;
  outline: none;
  min-height: 40px;
  max-height: 140px;
  overflow-y: auto;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.2s ease;
}
.support-input:focus {
  border-color: var(--dt-mirror-edge);
  background: color-mix(in srgb, var(--dt-bg-base) 60%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dt-mirror-edge) 12%, transparent);
}
.support-input::placeholder {
  color: var(--dt-text-muted);
}
.support-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.support-composer:has(.support-warn) .support-input {
  border-color: color-mix(in srgb, var(--dt-state-danger) 55%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dt-state-danger) 18%, transparent);
}

.support-send {
  align-self: flex-end;
  height: 40px;
  min-width: 72px;
  padding: 0 1.05rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--dt-text-title) 0%, var(--dt-border-active) 100%);
  color: var(--dt-text-on-gold);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 2px 8px rgba(212, 188, 140, 0.25);
}
.support-send:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(212, 188, 140, 0.4);
}
.support-send:active:not(:disabled) {
  transform: scale(0.96);
}
.support-send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.support-send__spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: support-spin 0.7s linear infinite;
}

@keyframes support-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .support-send__spinner { animation-duration: 1.5s; }
  .support-warn-enter-active,
  .support-warn-leave-active { transition: opacity 0.12s ease; }
}
</style>
