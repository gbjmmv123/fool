<script setup lang="ts">
import { HOME, t } from '~/data/copy'
const props = defineProps<{
  nickname: string | null
  hasCompletedExam: boolean
  departmentName: string | null
}>()

const displayName = computed(() => props.nickname ?? '探索者')
const statusText = computed(() => {
  if (props.hasCompletedExam && props.departmentName) return `属于 ${props.departmentName}`
  if (props.hasCompletedExam) return '笔试已完成，等待部门分配'
  return '尚未完成入会笔试'
})
</script>

<template>
  <section class="placeholder-card overview-card">
    <h2 class="overview-name">{{ displayName }}</h2>
    <p class="overview-status">{{ statusText }}</p>
  </section>
</template>

<style scoped>
.overview-card {
  text-align: center;
  padding: 2rem;
}
.overview-name {
  font-size: 1.5rem;
  color: var(--dt-text-title);
  margin: 0 0 0.5rem;
}
.overview-status {
  color: var(--dt-text-muted);
  font-size: 0.9rem;
  margin: 0;
}
</style>
