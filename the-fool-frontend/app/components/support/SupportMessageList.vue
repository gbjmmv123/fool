<script setup lang="ts">
import type { SupportMessage } from '~/types/support'

const props = defineProps<{
  messages: SupportMessage[]
  thinking?: boolean
}>()

const listRef = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (!listRef.value) return
    listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

onMounted(scrollToBottom)
watch(() => props.messages.length, scrollToBottom)
watch(() => props.thinking, (v) => { if (v) nextTick(scrollToBottom) })
</script>

<template>
  <div ref="listRef" class="support-list">
    <div v-if="messages.length === 0 && !thinking" class="support-empty">
      <div class="support-empty__icon" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="14" rx="10" ry="11.5" stroke="currentColor" stroke-width="1.3" opacity="0.7"/>
          <ellipse cx="16" cy="14" rx="8.5" ry="10" fill="color-mix(in srgb, var(--dt-mirror-edge) 10%, transparent)" />
          <path d="M11 8 Q 14 6 18 7" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.45" />
          <path d="M16 26 L16 30 M12.5 30 L19.5 30" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.75"/>
          <circle cx="21" cy="7" r="2.5" fill="color-mix(in srgb, var(--dt-state-success) 40%, transparent)" opacity="0.6" />
        </svg>
      </div>
      <p class="support-empty__text">镜面水波荡漾，银色文字浮现——</p>
      <p class="support-empty__sub">我是阿罗德斯。在镜中写下你的疑问，光芒会为你作答。</p>
    </div>

    <TransitionGroup v-else name="support-msg" tag="div" class="support-list__items">
      <div
        v-for="(m, i) in messages"
        :key="m.id"
        class="support-msg"
        :class="`support-msg--${m.role}`"
        :style="{ '--i': Math.min(i, 12) }"
      >
        <div v-if="m.role === 'staff'" class="support-avatar" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <ellipse cx="10" cy="8.5" rx="5.5" ry="6.5" stroke="currentColor" stroke-width="1.1"/>
            <path d="M10 15.5 L10 18 M8 18 L12 18" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="support-bubble">
          <span class="support-bubble__text">{{ m.content }}</span>
          <span class="support-bubble__time">{{ new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
      </div>

      <!-- 阿罗德斯思考中 -->
      <div v-if="thinking" key="thinking" class="support-msg support-msg--staff support-msg--thinking">
        <div class="support-avatar" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <ellipse cx="10" cy="8.5" rx="5.5" ry="6.5" stroke="currentColor" stroke-width="1.1"/>
            <path d="M10 15.5 L10 18 M8 18 L12 18" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="support-bubble support-bubble--loading">
          <span class="support-typing">
            <span class="support-typing__dot" />
            <span class="support-typing__dot" />
            <span class="support-typing__dot" />
          </span>
          <span class="support-typing__label">阿罗德斯正在镜中查看...</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.support-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.8rem 0.7rem 0.3rem;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  background: color-mix(in srgb, var(--dt-bg-base) 25%, transparent);
}

.support-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-bottom: 0.3rem;
}

.support-list::-webkit-scrollbar { width: 5px; }
.support-list::-webkit-scrollbar-track { background: transparent; }
.support-list::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dt-text-muted) 25%, transparent);
  border-radius: 3px;
}

/* --- Empty state --- */
.support-empty {
  margin: auto;
  text-align: center;
  color: var(--dt-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 2rem 1rem;
}

.support-empty__icon {
  color: var(--dt-text-title);
  opacity: 0.55;
  margin-bottom: 0.2rem;
  animation: empty-float 3.5s ease-in-out infinite;
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.support-empty__text {
  margin: 0;
  font-family: 'GuangLiangGanBei', serif;
  font-size: 1.05rem;
  letter-spacing: 0.14em;
  color: var(--dt-text-title);
}

.support-empty__sub {
  margin: 0;
  font-size: 0.76rem;
  letter-spacing: 0.05em;
  line-height: 1.6;
  max-width: 220px;
}

/* --- Messages --- */
.support-msg {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
}
.support-msg--user {
  justify-content: flex-end;
}
.support-msg--staff {
  justify-content: flex-start;
}

.support-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--dt-mirror-base) 80%, var(--dt-bg-elevated));
  border: 1px solid color-mix(in srgb, var(--dt-mirror-edge) 35%, transparent);
  color: var(--dt-mirror-text);
  opacity: 0.85;
}

.support-bubble {
  max-width: 75%;
  padding: 0.5rem 0.75rem;
  border-radius: 16px;
  font-size: 0.88rem;
  line-height: 1.55;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  position: relative;
}

.support-bubble__text {
  white-space: pre-wrap;
  word-break: break-word;
}

.support-bubble__time {
  font-size: 0.65rem;
  opacity: 0.45;
  align-self: flex-end;
  letter-spacing: 0.03em;
}

.support-msg--user .support-bubble {
  background: linear-gradient(135deg, var(--dt-text-title) 0%, var(--dt-border-active) 100%);
  color: var(--dt-text-on-gold);
  border-bottom-right-radius: 6px;
}

.support-msg--staff .support-bubble {
  background: color-mix(in srgb, var(--dt-mirror-base) 65%, var(--dt-bg-elevated));
  color: var(--dt-text-body);
  border: 1px solid color-mix(in srgb, var(--dt-mirror-edge) 35%, transparent);
  border-bottom-left-radius: 6px;
  backdrop-filter: blur(8px);
}

/* --- Loading / thinking bubble --- */
.support-bubble--loading {
  min-width: 160px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
}

.support-typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.support-typing__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dt-mirror-edge);
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.support-typing__dot:nth-child(2) { animation-delay: 0.2s; }
.support-typing__dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
  30% { transform: translateY(-5px); opacity: 0.85; }
}

.support-typing__label {
  font-size: 0.78rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.05em;
}

/* --- Transitions --- */
.support-msg-enter-active,
.support-msg-appear-active {
  transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--i, 0) * 50ms);
}
.support-msg-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
}
.support-msg-enter-from.support-msg--staff,
.support-msg-appear-from.support-msg--staff {
  opacity: 0;
  transform: translate(-10px, 4px);
}
.support-msg-enter-from.support-msg--user,
.support-msg-appear-from.support-msg--user {
  opacity: 0;
  transform: translate(10px, 4px);
}

/* Thinking indicator has its own gentle enter */
.support-msg--thinking.support-msg-enter-active,
.support-msg--thinking.support-msg-appear-active {
  transition: opacity 0.5s ease;
  transition-delay: 0s;
}
.support-msg--thinking.support-msg-enter-from,
.support-msg--thinking.support-msg-appear-from {
  opacity: 0;
  transform: none;
}

.support-msg-leave-to {
  opacity: 0;
}
.support-msg-move {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .support-msg-enter-active,
  .support-msg-appear-active,
  .support-msg-leave-active,
  .support-msg-move {
    transition: opacity 0.1s ease !important;
    transition-delay: 0s !important;
  }
  .support-msg-enter-from { transform: none !important; }
  .support-empty__icon { animation: none; }
  .support-typing__dot { animation: none; opacity: 0.5; }
}
</style>
