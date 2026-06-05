<script setup lang="ts">
import SupportMessageList from './SupportMessageList.vue'
import SupportComposer from './SupportComposer.vue'
import { COMMON } from '~/data/copy'

const { messages, sending, thinking, error, send, closePanel, dailyLimitReached, dailyRemaining } = useSupport()
const composerRef = ref<InstanceType<typeof SupportComposer> | null>(null)

async function onSubmit(content: string) {
  try {
    await send(content)
  } catch {}
}

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePanel()
}

function refreshPage() {
  window.location.reload()
}

onMounted(() => {
  if (import.meta.client) document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  if (import.meta.client) document.removeEventListener('keydown', onKeydown)
})

const DRAG_CLOSE_THRESHOLD = 90
const dragOffset = ref(0)
const dragging = ref(false)
const releasing = ref(false)
let dragStartY = 0
let activePointer: number | null = null
let releaseTimer: ReturnType<typeof setTimeout> | null = null

function onDragStart(e: PointerEvent) {
  if (!isMobile.value) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  activePointer = e.pointerId
  dragStartY = e.clientY
  dragging.value = true
  releasing.value = false
  if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onDragMove(e: PointerEvent) {
  if (!dragging.value || activePointer !== e.pointerId) return
  dragOffset.value = Math.max(0, e.clientY - dragStartY)
}

function onDragEnd(e: PointerEvent) {
  if (!dragging.value || activePointer !== e.pointerId) return
  dragging.value = false
  activePointer = null
  if (dragOffset.value > DRAG_CLOSE_THRESHOLD) {
    dragOffset.value = 0
    closePanel()
    return
  }
  releasing.value = true
  dragOffset.value = 0
  releaseTimer = setTimeout(() => { releasing.value = false; releaseTimer = null }, 320)
}

const panelStyle = computed(() => {
  if (!isMobile.value || dragOffset.value === 0) return undefined
  return { transform: `translateY(${dragOffset.value}px)` }
})

onUnmounted(() => { if (releaseTimer) clearTimeout(releaseTimer) })
</script>

<template>
  <Teleport to="body">
    <Transition :name="isMobile ? 'support-sheet' : 'support-popover'">
      <div class="support-shell" role="dialog" aria-label="小镜子客服" aria-modal="false">
        <div v-if="isMobile" class="support-backdrop" @click="closePanel" />
        <div
          class="support-panel"
          :class="{ 'is-dragging': dragging, 'is-releasing': releasing }"
          :style="panelStyle"
        >
          <header
            class="support-header"
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
          >
            <div v-if="isMobile" class="support-grabber" aria-hidden="true" />
            <div class="support-titlebar">
              <div class="support-title-group">
                <span class="support-dot" aria-hidden="true" />
                <span class="support-title">小镜子客服</span>
                <span v-if="thinking" class="support-thinking-badge">等待回复</span>
              </div>
              <button class="support-close" type="button" aria-label="关闭" @click="closePanel">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </header>
          <SupportMessageList :messages="messages" :thinking="thinking" :daily-limit-reached="dailyLimitReached" :daily-remaining="dailyRemaining" />
          <div v-if="error" class="support-error">
            <button class="btn support-error__btn" type="button" @click="refreshPage">{{ COMMON.refresh }}</button>
          </div>
          <SupportComposer
            ref="composerRef"
            :disabled="sending"
            :thinking="thinking" :daily-limit-reached="dailyLimitReached" :daily-remaining="dailyRemaining"
            @submit="onSubmit"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.support-shell {
  position: fixed;
  z-index: 91;
  pointer-events: none;
}

.support-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  pointer-events: auto;
}

.support-panel {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: var(--dt-bg-elevated);
  color: var(--dt-text-body);
  pointer-events: auto;
  overflow: hidden;
  border: 1px solid var(--dt-mirror-edge);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), 0 4px 16px rgba(120, 150, 220, 0.18),
    inset 0 1px 0 var(--dt-mirror-highlight);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

.support-panel.is-dragging { transition: none !important; }
.support-panel.is-releasing {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

@media (min-width: 768px) {
  .support-panel {
    right: 1.25rem;
    bottom: 1.25rem;
    width: 380px;
    height: min(580px, calc(100vh - 2.5rem));
    border-radius: 18px;
  }
}

@media (max-width: 767px) {
  .support-panel {
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px 20px 0 0;
    max-height: 85dvh;
  }
}

.support-header {
  flex-shrink: 0;
  padding-top: 0.4rem;
  touch-action: none;
}

.support-grabber {
  width: 32px;
  height: 4px;
  margin: 0 auto 0.2rem;
  border-radius: 2px;
  background: var(--dt-border-subtle);
}

.support-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 1rem 0.4rem;
}

.support-title-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.support-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dt-state-success);
  position: relative;
  box-shadow: 0 0 6px color-mix(in srgb, var(--dt-state-success) 50%, transparent);
  animation: support-dot-breath 3s ease-in-out infinite;
}
.support-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--dt-state-success) 40%, transparent) 0%, transparent 70%);
  animation: support-dot-ripple 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes support-dot-breath {
  0%, 100% { box-shadow: 0 0 6px color-mix(in srgb, var(--dt-state-success) 50%, transparent); transform: scale(1); }
  50% { box-shadow: 0 0 14px color-mix(in srgb, var(--dt-state-success) 85%, transparent); transform: scale(1.08); }
}
@keyframes support-dot-ripple {
  0% { transform: scale(0.7); opacity: 0.55; }
  80%, 100% { transform: scale(2.2); opacity: 0; }
}

.support-title {
  font-family: 'GuangLiangGanBei', serif;
  font-size: 1rem;
  letter-spacing: 0.18em;
  color: var(--dt-text-title);
}

.support-thinking-badge {
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

.support-close {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--dt-text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.15s ease, color 0.15s ease;
}
.support-close:hover {
  background: color-mix(in srgb, var(--dt-text-title) 12%, transparent);
  color: var(--dt-text-body);
}
.support-close:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 2px;
}

.support-error {
  padding: 0.35rem 1rem;
  background: color-mix(in srgb, var(--dt-state-danger) 10%, transparent);
  flex-shrink: 0;
  text-align: center;
}

.support-error__btn {
  min-width: 7rem;
}

.support-popover-enter-active {
  transition: opacity 0.28s ease, transform 0.36s cubic-bezier(0.16, 1, 0.3, 1);
}
.support-popover-leave-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.support-popover-enter-active .support-panel,
.support-popover-leave-active .support-panel {
  transition: inherit;
  transform-origin: bottom right;
}
.support-popover-enter-from .support-panel,
.support-popover-leave-to .support-panel {
  opacity: 0;
  transform: scale(0.85) translateY(12px);
}

.support-sheet-enter-active,
.support-sheet-leave-active { transition: opacity 0.25s ease; }
.support-sheet-enter-active .support-panel,
.support-sheet-leave-active .support-panel {
  transition: transform 0.36s cubic-bezier(0.16, 1, 0.3, 1);
}
.support-sheet-enter-from .support-panel,
.support-sheet-leave-to .support-panel { transform: translateY(100%); }
.support-sheet-enter-from,
.support-sheet-leave-to { opacity: 0; }

.support-popover-enter-active .support-panel,
.support-sheet-enter-active .support-panel { position: relative; }
.support-popover-enter-active .support-panel::before,
.support-sheet-enter-active .support-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.16) 50%, transparent 65%);
  background-size: 220% 100%;
  background-position: 120% 0;
  pointer-events: none;
  mix-blend-mode: screen;
  animation: support-panel-shimmer 0.85s ease-out 0.05s both;
  z-index: 1;
}
@keyframes support-panel-shimmer {
  0% { background-position: 120% 0; opacity: 0; }
  25% { opacity: 1; }
  100% { background-position: -20% 0; opacity: 0; }
}

.support-popover-enter-active .support-header,
.support-sheet-enter-active .support-header {
  animation: support-stagger-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both;
}
.support-popover-enter-active :deep(.support-list),
.support-sheet-enter-active :deep(.support-list) {
  animation: support-stagger-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.14s both;
}
.support-popover-enter-active :deep(.support-composer),
.support-sheet-enter-active :deep(.support-composer) {
  animation: support-stagger-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
}
@keyframes support-stagger-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .support-popover-enter-active,
  .support-popover-leave-active,
  .support-sheet-enter-active,
  .support-sheet-leave-active { transition: opacity 0.1s ease; }
  .support-popover-enter-active .support-panel,
  .support-popover-leave-active .support-panel,
  .support-sheet-enter-active .support-panel,
  .support-sheet-leave-active .support-panel { transition: none; }
  .support-popover-enter-active .support-panel::before,
  .support-sheet-enter-active .support-panel::before { animation: none; display: none; }
  .support-popover-enter-active .support-header,
  .support-sheet-enter-active .support-header,
  .support-popover-enter-active :deep(.support-list),
  .support-sheet-enter-active :deep(.support-list),
  .support-popover-enter-active :deep(.support-composer),
  .support-sheet-enter-active :deep(.support-composer) { animation: none; }
  .support-dot,
  .support-dot::after { animation: none; }
  .support-thinking-badge { animation: none; }
  .support-panel.is-releasing { transition: none !important; }
}
</style>
