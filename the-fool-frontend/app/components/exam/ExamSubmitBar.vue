<script setup lang="ts">
import { EXAM } from '~/data/copy'
defineProps<{
  submitting: boolean
  error: string | null
}>()

defineEmits<{ submit: [] }>()
</script>

<template>
  <div class="exam-submit-bar">
    <p v-if="error" class="exam-submit-bar__error" role="alert">{{ error }}</p>
    <button
      class="btn exam-submit-bar__btn"
      :disabled="submitting"
      @click="$emit('submit')"
    >
      {{ submitting ? EXAM.submittingBtn : EXAM.submitBtn }}
    </button>
  </div>
</template>

<style scoped>
.exam-submit-bar {
  position: sticky;
  bottom: 0;
  padding: 1rem;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.exam-submit-bar__error {
  color: var(--dt-state-danger);
  font-size: 0.875rem;
  margin: 0;
}
.exam-submit-bar__btn {
  padding: 0.75rem 2.5rem;
  font-size: 1rem;
}
.exam-submit-bar__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
