<script setup lang="ts">
import SupportMessageList from '~/components/support/SupportMessageList.vue'
import SupportComposer from '~/components/support/SupportComposer.vue'

definePageMeta({ title: '小镜子客服' })

const { state, initialized } = useBootstrap()
const { messages, sending, thinking, error, send, openPanel, closePanel, dailyLimitReached, dailyRemaining } = useSupport()

watchEffect(() => {
  if (initialized.value && !state.value.hasCompletedExam) {
    navigateTo('/')
  }
})

onMounted(() => openPanel())
onUnmounted(() => closePanel())

async function onSubmit(content: string) {
  try {
    await send(content)
  } catch {}
}
</script>

<template>
  <div class="chat-page">
    <div class="chat-card">
      <header class="chat-header">
        <div class="chat-header__top">
          <div class="chat-header__title-row">
            <span class="chat-dot" aria-hidden="true" />
            <h1 class="chat-title">小镜子客服</h1>
            <span v-if="thinking" class="chat-thinking-badge">等待回复</span>
          </div>
          <p class="chat-subtitle">表面刻有奇异花纹的古老银镜</p>
        </div>
        <div class="chat-header__ornament" aria-hidden="true">
          <svg width="120" height="2" viewBox="0 0 120 2" fill="none">
            <line x1="0" y1="1" x2="40" y2="1" stroke="var(--dt-mirror-edge)" stroke-width="0.5" opacity="0.4"/>
            <circle cx="60" cy="1" r="1.5" fill="var(--dt-mirror-edge)" opacity="0.5"/>
            <line x1="80" y1="1" x2="120" y2="1" stroke="var(--dt-mirror-edge)" stroke-width="0.5" opacity="0.4"/>
          </svg>
        </div>
      </header>

      <div class="chat-body">
        <SupportMessageList :messages="messages" :thinking="thinking" :daily-limit-reached="dailyLimitReached" :daily-remaining="dailyRemaining" />
      </div>

      <div v-if="error" class="chat-error">{{ error }}</div>

      <div class="chat-footer">
        <SupportComposer :disabled="sending" :thinking="thinking" :daily-limit-reached="dailyLimitReached" :daily-remaining="dailyRemaining" @submit="onSubmit" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 68px);
  margin: -1.5rem;
  background: color-mix(in srgb, var(--dt-bg-base) 70%, var(--dt-bg-elevated));
}

@media (min-width: 768px) {
  .chat-page {
    height: calc(100dvh - 72px);
    align-items: center;
    padding: 1.5rem 0;
  }
}

.chat-card {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--dt-bg-elevated);
}

@media (min-width: 768px) {
  .chat-card {
    width: min(600px, 92vw);
    max-height: min(720px, calc(100dvh - 104px));
    border-radius: 20px;
    border: 1px solid var(--dt-mirror-edge);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35), 0 2px 10px rgba(120, 150, 220, 0.12),
      inset 0 1px 0 var(--dt-mirror-highlight);
    overflow: hidden;
  }
}

.chat-header {
  padding: 1rem 1.2rem 0.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--dt-mirror-edge) 20%, transparent);
  flex-shrink: 0;
  text-align: center;
}

@media (min-width: 768px) {
  .chat-header {
    padding: 1.25rem 1.5rem 0.6rem;
  }
}

.chat-header__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.chat-header__title-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.chat-dot {
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--dt-state-success);
  box-shadow: 0 0 8px color-mix(in srgb, var(--dt-state-success) 60%, transparent);
  animation: chat-dot-breath 2.4s ease-in-out infinite;
  flex-shrink: 0;
}
.chat-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--dt-state-success) 35%, transparent) 0%, transparent 70%);
  animation: chat-dot-ripple 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes chat-dot-breath {
  0%, 100% { box-shadow: 0 0 6px color-mix(in srgb, var(--dt-state-success) 50%, transparent); transform: scale(1); }
  50% { box-shadow: 0 0 14px color-mix(in srgb, var(--dt-state-success) 85%, transparent); transform: scale(1.08); }
}
@keyframes chat-dot-ripple {
  0% { transform: scale(0.7); opacity: 0.55; }
  80%, 100% { transform: scale(2.2); opacity: 0; }
}

.chat-title {
  margin: 0;
  font-family: 'GuangLiangGanBei', serif;
  font-size: 1.1rem;
  letter-spacing: 0.2em;
  color: var(--dt-text-title);
  font-weight: normal;
}

.chat-thinking-badge {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: var(--dt-mirror-text);
  background: color-mix(in srgb, var(--dt-mirror-base) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--dt-mirror-edge) 45%, transparent);
  border-radius: 8px;
  padding: 0.08rem 0.5rem;
  animation: badge-pulse 1.8s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.chat-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.06em;
}

.chat-header__ornament {
  display: flex;
  justify-content: center;
  margin-top: 0.45rem;
  opacity: 0.6;
}

.chat-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--dt-bg-base) 30%, transparent);
}

.chat-footer {
  flex-shrink: 0;
}

.chat-error {
  padding: 0.35rem 1.2rem;
  font-size: 0.76rem;
  color: var(--dt-state-danger);
  background: color-mix(in srgb, var(--dt-state-danger) 10%, transparent);
  flex-shrink: 0;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .chat-dot, .chat-dot::after { animation: none; }
  .chat-thinking-badge { animation: none; }
}
</style>
