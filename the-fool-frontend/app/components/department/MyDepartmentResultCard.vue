<script setup lang="ts">
import { getDepartmentData } from '~/data/departments'
import { formatDateTime } from '~/utils/time'
import { DEPARTMENT_COPY, t } from '~/data/copy'

const props = defineProps<{
  joinedAt: string
  resultId: string
  departmentId: string
}>()

const dept = computed(() => getDepartmentData(props.departmentId))
</script>

<template>
  <section class="placeholder-card result-card">
    <h3 class="result-card__title">{{ DEPARTMENT_COPY.myResultTitle }}</h3>
    <p class="result-card__joined">{{ t(DEPARTMENT_COPY.joinedAt, { date: formatDateTime(joinedAt) }) }}</p>
    <button
      class="btn result-card__btn"
      @click="navigateTo(`/exam/result?resultId=${encodeURIComponent(resultId)}`)"
    >
      查看完整结果
    </button>
  </section>
</template>

<style scoped>
.result-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.result-card__title {
  font-size: 1rem;
  color: var(--dt-text-heading);
  margin: 0;
}
.result-card__summary {
  color: var(--dt-text-body);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}
.result-card__joined {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  margin: 0;
}
.result-card__btn {
  align-self: flex-start;
  font-size: 0.875rem;
}
</style>
