<script setup lang="ts">
import { HOME } from '~/data/copy'
defineProps<{ minimal?: boolean; flow?: boolean }>()
</script>

<template>
  <button
    v-if="minimal"
    class="church-intro-link"
    @click="navigateTo('/about')"
  >
    了解愚者教会
  </button>

  <button
    v-else-if="flow"
    class="church-intro-link church-intro-link--flow"
    @click="navigateTo('/about')"
  >
    了解愚者教会
  </button>

  <section
    v-else
    class="church-intro-card"
    role="button"
    tabindex="0"
    @click="navigateTo('/about')"
    @keydown.enter="navigateTo('/about')"
  >
    <div class="card-shimmer" aria-hidden="true" />

    <div class="arcana-medallion" aria-hidden="true">
      <div class="arcana-ring-outer" /> 
      <div class="arcana-ring-inner" />
      <span class="arcana-numeral">0</span>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ HOME.churchLinkText }}</h3>
      <span class="card-cta">
        探索
        <svg class="cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>
  </section>
</template>

<style scoped>
/* ── Minimal link ── */
.church-intro-link {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.82rem;
  color: var(--dt-text-muted);
  opacity: 0.6;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(212, 184, 134, 0.25);
  border-radius: 0;
  white-space: nowrap;
  transition: color 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
  animation: fade-in 0.5s ease both;
  animation-delay: 600ms;
}

.church-intro-link:hover {
  color: var(--dt-text-title);
  opacity: 1;
  border-bottom-color: rgba(212, 184, 134, 0.55);
}

.church-intro-link:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 3px;
  border-radius: 2px;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 0.6; }
}

.church-intro-link--flow {
  position: static;
  transform: none;
  display: block;
  margin: 0 auto;
}

@media (prefers-reduced-motion: reduce) {
  .church-intro-link {
    animation: none;
    transition: none;
  }
}

/* ── Full card ── */
.church-intro-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--dt-radius-card);
  border: 1px solid var(--dt-border-default);
  background: var(--dt-bg-elevated);
  box-shadow: var(--dt-shadow-card);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  text-decoration: none;
  outline: none;
}

.church-intro-card:hover {
  border-color: var(--dt-border-highlight);
  box-shadow:
    0 0 0 1px var(--dt-border-active),
    var(--dt-shadow-card),
    0 0 28px rgba(212, 184, 134, 0.12);
  transform: translateY(-2px);
}

.church-intro-card:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 3px;
}

/* Shimmer sweep */
.card-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    108deg,
    transparent 38%,
    rgba(212, 184, 134, 0.07) 50%,
    transparent 62%
  );
  transform: translateX(-110%);
  pointer-events: none;
}

.church-intro-card:hover .card-shimmer {
  transform: translateX(110%);
  transition: transform 0.55s ease;
}

/* Arcana medallion */
.arcana-medallion {
  position: relative;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arcana-ring-outer,
.arcana-ring-inner {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--dt-border-default);
  transition: border-color 0.25s ease, opacity 0.25s ease;
}

.arcana-ring-outer {
  inset: 0;
  opacity: 0.55;
}

.arcana-ring-inner {
  inset: 8px;
  opacity: 0.3;
}

.church-intro-card:hover .arcana-ring-outer {
  border-color: var(--dt-border-highlight);
  opacity: 0.85;
}

.church-intro-card:hover .arcana-ring-inner {
  border-color: var(--dt-border-active);
  opacity: 0.5;
}

.arcana-numeral {
  font-size: 1.35rem;
  font-style: italic;
  color: var(--dt-text-title);
  line-height: 1;
  position: relative;
  z-index: 1;
  transition: color 0.25s ease;
  user-select: none;
}

.church-intro-card:hover .arcana-numeral {
  color: var(--dt-border-highlight);
}

/* Card body */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.card-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--dt-text-muted);
  margin: 0;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--dt-text-heading);
  margin: 0;
  transition: color 0.25s ease;
}

.church-intro-card:hover .card-title {
  color: var(--dt-text-title);
}

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: var(--dt-text-title);
  margin-top: 0.3rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.church-intro-card:hover .card-cta {
  opacity: 1;
}

.cta-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.church-intro-card:hover .cta-arrow {
  transform: translateX(3px);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .church-intro-card,
  .arcana-ring-outer,
  .arcana-ring-inner,
  .arcana-numeral,
  .card-title,
  .card-cta,
  .cta-arrow {
    transition: none;
  }

  .card-shimmer {
    display: none;
  }
}
</style>
