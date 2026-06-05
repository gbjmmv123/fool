<script setup lang="ts">
import { submitFeedback } from '~/services/feedback'
import { COMMON, MODAL } from '~/data/copy'

const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()
const { userId } = useUserIdentity()

type Phase = 'initial' | 'feedback' | 'success'
const phase = ref<Phase>('initial')
const feedbackText = ref('')
const submitting = ref(false)
const MAX_LEN = 500

const charCount = computed(() => feedbackText.value.length)
const overLimit = computed(() => charCount.value > MAX_LEN)
const canSubmit = computed(() => feedbackText.value.trim().length > 0 && !overLimit.value && !submitting.value)

function close() {
  closeDialog(props.dialogKey)
}

function handleRefresh() {
  window.location.reload()
}

function goToFeedback() {
  phase.value = 'feedback'
}

function goBack() {
  phase.value = 'initial'
  feedbackText.value = ''
}

async function handleSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await submitFeedback(feedbackText.value.trim(), userId.value ?? undefined)
  } catch {
    // silent — still show success
  } finally {
    submitting.value = false
    phase.value = 'success'
  }
}
</script>

<template>
  <ModalDialog
    :blocking="false"
    :mask-closable="true"
    :close-on-esc="true"
    @close="close"
  >
    <!-- ── Phase: initial ── -->
    <Transition name="phase" mode="out-in">
      <div v-if="phase === 'initial'" key="initial" class="em-phase">
        <div class="em-avatar-wrap">
          <img src="/static/avatars/amon.png" alt="阿蒙" class="em-avatar" />
          <div class="em-avatar-glow" aria-hidden="true" />
        </div>
        <h2 class="em-title">{{ MODAL.errorTitle }}</h2>
        <p class="em-subtitle">{{ MODAL.errorSubtitle }}</p>
        <div class="em-actions">
          <button class="em-btn em-btn--outline" type="button" @click="handleRefresh">
            <span class="em-btn__icon" aria-hidden="true">↺</span>
            {{ MODAL.errorRefresh }}
          </button>
          <button class="em-btn em-btn--primary" type="button" @click="goToFeedback">
            <span class="em-btn__icon" aria-hidden="true">✉</span>
            {{ MODAL.errorFeedback }}
          </button>
        </div>
      </div>

      <!-- ── Phase: feedback ── -->
      <div v-else-if="phase === 'feedback'" key="feedback" class="em-phase">
        <button class="em-back" type="button" @click="goBack">
          <span aria-hidden="true">←</span> {{ MODAL.errorBack }}
        </button>
        <h2 class="em-title em-title--sm">{{ MODAL.errorFeedbackTitle }}</h2>
        <p class="em-subtitle">描述一下遇到了什么问题，帮助我改进</p>
        <div class="em-textarea-wrap">
          <textarea
            v-model="feedbackText"
            class="em-textarea"
            :class="{ 'em-textarea--over': overLimit }"
            :placeholder="MODAL.errorFeedbackPlaceholder"
            rows="4"
            :maxlength="MAX_LEN + 50"
            autofocus
          />
          <span class="em-char-count" :class="{ 'em-char-count--over': overLimit }">
            {{ charCount }} / {{ MAX_LEN }}
          </span>
        </div>
        <div class="em-actions">
          <button class="em-btn em-btn--outline" type="button" @click="goBack">{{ MODAL.cancelDefault }}</button>
          <button
            class="em-btn em-btn--primary"
            type="button"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="em-btn__spinner" aria-hidden="true" />
            {{ submitting ? MODAL.errorFeedbackSubmitting : MODAL.errorFeedbackSubmit }}
          </button>
        </div>
      </div>

      <!-- ── Phase: success ── -->
      <div v-else key="success" class="em-phase em-phase--success">
        <div class="em-avatar-wrap em-avatar-wrap--sm">
          <img src="/static/avatars/amon.png" alt="阿蒙" class="em-avatar em-avatar--sm" />
          <div class="em-avatar-glow em-avatar-glow--sm" aria-hidden="true" />
        </div>
        <h2 class="em-title">{{ MODAL.errorThanksTitle }}</h2>
        <p class="em-subtitle em-subtitle--warm">{{ MODAL.errorThanksSubtitle }}</p>
        <button class="em-btn em-btn--outline em-btn--full" type="button" @click="close">
          {{ COMMON.close }}
        </button>
      </div>
    </Transition>
  </ModalDialog>
</template>

<style scoped>
.em-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  text-align: center;
}

.em-phase--success {
  gap: 0.5rem;
}

.em-avatar-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 0.25rem;
}

.em-avatar-wrap--sm {
  width: 72px;
  height: 72px;
}

.em-avatar {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom;
}

.em-avatar--sm {
  object-position: center;
}

.em-avatar-glow {
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 60%,
    rgba(212, 184, 134, 0.14) 0%,
    rgba(212, 184, 134, 0.05) 50%,
    transparent 75%
  );
  filter: blur(16px);
}

.em-avatar-glow--sm {
  inset: -10px;
}

.em-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--dt-text-title);
  margin: 0;
}

.em-title--sm {
  font-size: 1rem;
}

.em-subtitle {
  font-size: 0.85rem;
  color: var(--dt-text-muted);
  margin: 0;
  line-height: 1.5;
}

.em-subtitle--warm {
  color: var(--dt-text-title);
}

.em-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  width: 100%;
}

.em-back {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--dt-text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.25rem 0;
  transition: color 0.15s;
}

.em-back:hover {
  color: var(--dt-text-title);
}

.em-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
  border: 1px solid transparent;
}

.em-btn--outline {
  background: transparent;
  border-color: var(--dt-border-subtle);
  color: var(--dt-text-body);
  flex: 1;
}

.em-btn--outline:hover {
  border-color: var(--dt-border-default);
  color: var(--dt-text-title);
}

.em-btn--primary {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-border-default);
  color: var(--dt-text-title);
  flex: 1;
}

.em-btn--primary:hover:not(:disabled) {
  background: rgba(212, 184, 134, 0.25);
}

.em-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.em-btn--full {
  width: 100%;
}

.em-btn__icon {
  font-size: 1rem;
}

.em-btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--dt-border-subtle);
  border-top-color: var(--dt-text-title);
  border-radius: 50%;
  animation: em-spin 0.7s linear infinite;
}

@keyframes em-spin {
  to { transform: rotate(360deg); }
}

.em-textarea-wrap {
  position: relative;
  width: 100%;
}

.em-textarea {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--dt-border-subtle);
  border-radius: 10px;
  color: var(--dt-text-body);
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  padding: 0.75rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
}

.em-textarea:focus {
  border-color: var(--dt-border-default);
}

.em-textarea--over {
  border-color: var(--dt-state-danger);
}

.em-char-count {
  display: block;
  text-align: right;
  font-size: 0.72rem;
  color: var(--dt-text-muted);
  margin-top: 0.25rem;
}

.em-char-count--over {
  color: var(--dt-state-danger);
}

.phase-enter-active,
.phase-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.phase-enter-from,
.phase-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
