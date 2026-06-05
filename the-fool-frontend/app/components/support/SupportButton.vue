<script setup lang="ts">
import SupportPanel from './SupportPanel.vue'

const { open, unread, togglePanel, startPolling, stopPolling, bindVisibility, unbindVisibility } = useSupport()
const reducedMotion = useReducedMotion()

onMounted(() => {
  startPolling()
  bindVisibility()
})

onUnmounted(() => {
  stopPolling()
  unbindVisibility()
})

const badgeText = computed(() => {
  if (unread.value <= 0) return ''
  return unread.value > 99 ? '99+' : String(unread.value)
})
</script>

<template>
  <Transition name="support-btn">
    <button
      v-show="!open"
      type="button"
      class="support-button"
      :class="{ 'is-static': reducedMotion }"
      aria-label="阿罗德斯客服"
      @click="togglePanel"
    >
      <span class="support-button__mirror" aria-hidden="true">
        <span class="support-button__shimmer" />
        <span class="support-button__highlight" />
      </span>
      <span class="support-button__icon" aria-hidden="true">
        <!-- Mirror-frame oval with inner crescent — evokes a hand mirror -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="11" rx="7.2" ry="8.2" stroke="currentColor" stroke-width="1.4" />
          <path d="M8.4 7.5 Q 10 6 12.5 6.4" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.7" />
          <path d="M12 19.5 L12 22 M9.5 22 L14.5 22" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
      </span>
      <span class="support-button__label">阿罗德斯</span>
      <span v-if="badgeText" class="support-button__badge">{{ badgeText }}</span>
    </button>
  </Transition>
  <SupportPanel v-if="open" />
</template>

<style scoped>
.support-button {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 80;
  height: 48px;
  padding: 0 1.1rem 0 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 24px;
  border: 1px solid var(--dt-mirror-edge);
  background: var(--dt-mirror-base);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  color: var(--dt-mirror-text);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--dt-mirror-shadow), inset 0 1px 0 var(--dt-mirror-highlight),
    inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.support-button:hover {
  transform: translateY(-1px);
  border-color: var(--dt-mirror-highlight);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(140, 170, 230, 0.3),
    inset 0 1px 0 var(--dt-mirror-highlight), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
}

.support-button:active {
  transform: translateY(0);
}

.support-button:focus-visible {
  outline: 2px solid var(--dt-mirror-highlight);
  outline-offset: 3px;
}

/* Tinted glass layer on top of backdrop blur */
.support-button__mirror {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    var(--dt-mirror-tint) 0%,
    transparent 45%,
    var(--dt-mirror-tint) 100%
  );
  pointer-events: none;
}

/* Slow shimmer band sweeping across the surface */
.support-button__shimmer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    115deg,
    transparent 30%,
    var(--dt-mirror-shimmer) 50%,
    transparent 70%
  );
  background-size: 220% 100%;
  background-position: 100% 0;
  animation: mirror-shimmer 6.5s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

/* Top edge highlight stripe */
.support-button__highlight {
  position: absolute;
  inset: 1px 1px auto 1px;
  height: 50%;
  border-radius: 24px 24px 50% 50% / 24px 24px 100% 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.18) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.support-button__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: var(--dt-mirror-text);
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45));
}

.support-button__label {
  position: relative;
  font-family: 'GuangLiangGanBei', serif;
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.support-button__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--dt-state-danger);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(209, 107, 107, 0.55);
  border: 1.5px solid rgba(0, 0, 0, 0.35);
}

@keyframes mirror-shimmer {
  0% { background-position: 100% 0; }
  55% { background-position: -20% 0; }
  100% { background-position: -20% 0; }
}

/* Toggle transition */
.support-btn-enter-active,
.support-btn-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.support-btn-enter-from,
.support-btn-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}

/* Reduced motion */
.support-button.is-static .support-button__shimmer { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .support-button { transition: none; }
  .support-button__shimmer { animation: none; }
  .support-btn-enter-active,
  .support-btn-leave-active { transition: none; }
}

/* Mobile spacing */
@media (max-width: 480px) {
  .support-button {
    right: 0.9rem;
    bottom: 0.9rem;
  }
}
</style>
