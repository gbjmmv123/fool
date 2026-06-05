<script setup lang="ts">
import { HOME } from '~/data/copy'

function retakeExam() {
  navigateTo('/exam')
}
</script>

<template>
  <div class="result-actions">
    <button class="result-actions__retake" @click="retakeExam">
      <span class="result-actions__label">{{ HOME.retakeLabel }}</span>
      <span class="result-actions__cta">
        <span>{{ HOME.examEntryRetake }}</span>
        <span aria-hidden="true">→</span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.result-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  width: min(400px, 100%);
  margin: 0 auto;
  padding: 0.95rem 0.2rem 0;
  color: var(--dt-text-muted);
}

.result-actions__retake {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.32rem;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: right;
  cursor: pointer;
}

.result-actions__label {
  font-size: 0.62rem;
  letter-spacing: 0.32em;
  color: color-mix(in srgb, var(--dt-text-title) 50%, var(--dt-text-muted));
}

.result-actions__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--dt-text-title) 80%, var(--dt-text-body));
  transition: color 0.25s ease;
}

.result-actions__retake:hover .result-actions__cta {
  color: var(--dt-text-title);
}

.result-actions__retake:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 4px;
  border-radius: 4px;
}

@media (max-width: 480px) {
  .result-actions {
    padding-top: 0.85rem;
  }
}
</style>
