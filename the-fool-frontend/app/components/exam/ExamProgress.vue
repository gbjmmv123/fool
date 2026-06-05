<script setup lang="ts">
import { EXAM, t } from '~/data/copy'
const props = defineProps<{
  answered: number
  total: number
}>()

const ratio = computed(() => props.total > 0 ? (props.answered / props.total) * 100 : 0)

const sentinel = ref<HTMLElement | null>(null)
const pinned = ref(false)

onMounted(() => {
  if (!sentinel.value) return
  const navH = window.matchMedia('(min-width: 768px)').matches ? 72 : 68
  const observer = new IntersectionObserver(
    ([entry]) => { pinned.value = !entry.isIntersecting },
    { threshold: 0, rootMargin: `-${navH}px 0px 0px 0px` }
  )
  observer.observe(sentinel.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <!-- sentinel marks the original position -->
  <div ref="sentinel" class="exam-progress__sentinel" aria-hidden="true" />

  <!-- inline bar (visible when not scrolled past) -->
  <div
    class="exam-progress"
    :class="{ 'exam-progress--hidden': pinned }"
    role="status"
    :aria-label="t(EXAM.progressAriaLabel, { answered, total })"
  >
    <div class="exam-progress__inner">
      <span class="exam-progress__label">
        <span class="exam-progress__count">{{ answered }}</span>
        <span class="exam-progress__sep">/</span>
        <span class="exam-progress__total">{{ total }}</span>
        <span class="exam-progress__unit">{{ EXAM.progressAnswered }}</span>
      </span>
      <span class="exam-progress__pct">{{ Math.round(ratio) }}%</span>
    </div>
    <div class="exam-progress__bar-wrap">
      <div class="exam-progress__bar" :style="{ width: `${ratio}%` }" />
    </div>
  </div>

  <!-- pinned bar (teleported to top when scrolled past) -->
  <Teleport to="body">
    <Transition name="exam-progress-pin">
      <div
        v-if="pinned"
        class="exam-progress exam-progress--pinned"
        role="status"
        :aria-label="t(EXAM.progressAriaLabel, { answered, total })"
      >
        <div class="exam-progress__inner">
          <span class="exam-progress__label">
            <span class="exam-progress__count">{{ answered }}</span>
            <span class="exam-progress__sep">/</span>
            <span class="exam-progress__total">{{ total }}</span>
            <span class="exam-progress__unit">{{ EXAM.progressAnswered }}</span>
          </span>
          <span class="exam-progress__pct">{{ Math.round(ratio) }}%</span>
        </div>
        <div class="exam-progress__bar-wrap">
          <div class="exam-progress__bar" :style="{ width: `${ratio}%` }" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.exam-progress__sentinel {
  height: 0;
  margin: 0;
  padding: 0;
}

.exam-progress {
  padding: 0.75rem 1.25rem;
  background: rgba(14, 14, 14, 0.88);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(212, 184, 134, 0.1);
  border-radius: 12px;
  transition: opacity 0.2s ease;
}

.exam-progress--hidden {
  opacity: 0;
  pointer-events: none;
}

.exam-progress--pinned {
  position: fixed;
  top: 68px;
  left: 0;
  right: 0;
  z-index: 30;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: 1px solid rgba(212, 184, 134, 0.12);
  padding: 0.6rem 1.5rem;
}

@media (min-width: 768px) {
  .exam-progress--pinned {
    top: 72px;
    padding: 0.6rem 2rem;
  }
}

.exam-progress__inner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.exam-progress__label {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--dt-text-muted);
}

.exam-progress__count {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dt-border-default);
  font-variant-numeric: tabular-nums;
}

.exam-progress__sep {
  color: var(--dt-border-subtle);
  margin: 0 0.1rem;
}

.exam-progress__total {
  font-size: 0.85rem;
  color: var(--dt-text-muted);
  font-variant-numeric: tabular-nums;
}

.exam-progress__unit {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  margin-left: 0.15rem;
}

.exam-progress__pct {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.exam-progress__bar-wrap {
  height: 3px;
  background: rgba(212, 184, 134, 0.1);
  border-radius: 99px;
  overflow: hidden;
}

.exam-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--dt-border-default), var(--dt-border-highlight));
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(212, 184, 134, 0.35);
}

.exam-progress-pin-enter-active,
.exam-progress-pin-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.exam-progress-pin-enter-from,
.exam-progress-pin-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
