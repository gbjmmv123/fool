<script setup lang="ts">
import { RESULT } from '~/data/copy'
const reduced = useReducedMotion()
</script>

<template>
  <section class="result-loading">
    <p class="result-loading__title">{{ RESULT.loadingTitle }}</p>
    <p class="result-loading__sub">{{ RESULT.loadingSub }}</p>
    <div
      class="result-loading__spinner"
      :class="{ 'is-reduced': reduced }"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.result-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
}
.result-loading__title {
  font-size: 1.1rem;
  color: var(--dt-text-heading);
  margin: 0;
}
.result-loading__sub {
  color: var(--dt-text-muted);
  font-size: 0.9rem;
  margin: 0;
}
.result-loading__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--dt-border-subtle);
  border-top-color: var(--dt-border-default);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.result-loading__spinner.is-reduced {
  animation: pulse 1.5s ease-in-out infinite;
  border-top-color: var(--dt-border-subtle);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@media (prefers-reduced-motion: reduce) {
  .result-loading__spinner {
    animation: pulse 1.5s ease-in-out infinite;
    border-top-color: var(--dt-border-subtle);
  }
}
</style>
