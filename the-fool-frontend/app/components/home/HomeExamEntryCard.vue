<script setup lang="ts">
import { HOME } from '~/data/copy'
const props = defineProps<{
  mode: 'start' | 'review'
  latestExamResultId: string | null
}>()

function goToExam() {
  navigateTo('/exam')
}

function goToResult() {
  if (props.latestExamResultId) {
    navigateTo(`/exam/result?resultId=${props.latestExamResultId}`)
  }
}
</script>

<template>
  <section v-if="mode === 'start'" class="exam-hero-section">
    <div class="hero-glow" aria-hidden="true" />

    <div class="hero-content">
      <h2 class="hero-title">{{ HOME.examEntryTitle }}</h2>
      <div class="hero-divider" aria-hidden="true">
        <span class="divider-line divider-line--left" />
        <span class="divider-line divider-line--right" />
      </div>
      <button class="ritual-btn" @click="goToExam">
        <span class="ritual-btn__text">立即开始</span>
      </button>
    </div>
  </section>

  <section v-else class="placeholder-card exam-entry-card">
    <h3 class="card-title">{{ HOME.examEntryTitle }}</h3>
    <p class="card-desc">你已完成笔试。</p>
    <div class="exam-actions">
      <button class="btn" @click="goToResult">{{ HOME.examEntryViewResult }}</button>
      <button class="btn btn--ghost" @click="goToExam">{{ HOME.examEntryRetake }}</button>
    </div>
  </section>
</template>

<style scoped>
/* ── Start mode: Hero ── */
.exam-hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 1.5rem;
}

/* Circular ambient glow — equal spread in all directions, breathing */
.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 500px;
  height: 500px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(212, 184, 134, 0.18) 0%,
    rgba(212, 184, 134, 0.08) 35%,
    rgba(212, 184, 134, 0.02) 60%,
    transparent 75%
  );
  animation: glow-breathe 4.5s ease-in-out infinite;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-title {
  font-size: clamp(2.4rem, 10vw, 3.2rem);
  font-weight: 300;
  color: var(--dt-text-title);
  margin: 0;
  letter-spacing: 0.12em;
  line-height: 1;
  animation: fade-up 0.6s ease both;
  animation-delay: 80ms;
}

.hero-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.4rem 0 2rem;
}

.divider-line {
  display: block;
  height: 1px;
  width: 44px;
  background: linear-gradient(to right, transparent, rgba(212, 184, 134, 0.38));
  transform-origin: right center;
  animation: scale-in 0.5s ease both;
  animation-delay: 200ms;
}

.divider-line--right {
  transform-origin: left center;
  background: linear-gradient(to left, transparent, rgba(212, 184, 134, 0.38));
}

/* Ritual button */
.ritual-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 152px;
  height: 46px;
  border: 1px solid var(--dt-border-default);
  border-radius: 23px;
  background: transparent;
  cursor: pointer;
  outline: none;
  animation: fade-up 0.6s ease both;
  animation-delay: 320ms;
  transition: transform 0.15s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.ritual-btn:hover {
  border-color: var(--dt-border-highlight);
  box-shadow: 0 0 28px rgba(212, 184, 134, 0.28);
}

.ritual-btn:active {
  transform: scale(0.96);
}

.ritual-btn:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 3px;
}

.ritual-btn__text {
  position: relative;
  z-index: 1;
  font-size: 0.88rem;
  letter-spacing: 0.1em;
  color: var(--dt-text-title);
}

/* ── Keyframes ── */
@keyframes glow-breathe {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* ── Review mode ── */
.exam-entry-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-title {
  font-size: 1.1rem;
  color: var(--dt-text-heading);
  margin: 0;
}

.card-desc {
  color: var(--dt-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.exam-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn--ghost {
  background: transparent;
  border-color: var(--dt-border-subtle);
  color: var(--dt-text-muted);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .hero-glow,
  .hero-title,
  .divider-line,
  .ritual-btn {
    animation: none;
  }
}
</style>
