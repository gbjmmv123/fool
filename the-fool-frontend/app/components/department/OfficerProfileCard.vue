<script setup lang="ts">
import { getDepartmentData } from '~/data/departments'

const props = defineProps<{
  departmentId: string
  departmentName: string
}>()

const staticData = computed(() => getDepartmentData(props.departmentId))
</script>

<template>
  <section class="placeholder-card officer-card">
    <div class="officer-card__header">
      <img
        v-if="staticData?.officer"
        :src="staticData.officer.avatar"
        :alt="staticData.officer.name"
        class="officer-card__avatar"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div class="officer-card__info">
        <p class="officer-card__dept">{{ departmentName }}</p>
        <h2 class="officer-card__name">{{ staticData?.officer.name }}</h2>
      </div>
    </div>
    <p v-if="staticData?.description" class="officer-card__desc">{{ staticData.description }}</p>
  </section>
</template>

<style scoped>
.officer-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.officer-card__header {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}
.officer-card__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--dt-border-default);
  background: var(--dt-bg-elevated);
  flex-shrink: 0;
}
.officer-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.officer-card__dept {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  margin: 0;
}
.officer-card__name {
  font-size: 1.2rem;
  color: var(--dt-text-title);
  margin: 0;
}
.officer-card__desc {
  color: var(--dt-text-body);
  font-size: 0.9rem;
  line-height: 1.75;
  margin: 0;
}
</style>
