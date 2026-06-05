<script setup lang="ts">
import type { DepartmentMember } from '~/types/department'
import { formatDateTime } from '~/utils/time'
import { DEPARTMENT_COPY, t } from '~/data/copy'

const props = defineProps<{
  members: DepartmentMember[]
  total: number
}>()

const displayed = computed(() => props.members.slice(0, 12))
</script>

<template>
  <section class="placeholder-card member-list">
    <h3 class="member-list__title">{{ DEPARTMENT_COPY.memberTitle }}</h3>
    <ul class="member-list__grid">
      <li v-for="m in displayed" :key="m.userId" class="member-list__item">
        <span class="member-list__avatar" aria-hidden="true">{{ m.nickname.charAt(0) }}</span>
        <div class="member-list__info">
          <span class="member-list__name">{{ m.nickname }}</span>
          <span class="member-list__joined">{{ formatDateTime(m.joinedAt) }}</span>
        </div>
      </li>
    </ul>
    <p class="member-list__total">{{ t(DEPARTMENT_COPY.totalMembers, { count: total }) }}</p>
  </section>
</template>

<style scoped>
.member-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.member-list__title {
  font-size: 1rem;
  color: var(--dt-text-heading);
  margin: 0;
}
.member-list__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}
.member-list__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.member-list__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--dt-border-subtle);
  color: var(--dt-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.member-list__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.member-list__name {
  font-size: 0.875rem;
  color: var(--dt-text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.member-list__joined {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
}
.member-list__total {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  margin: 0;
}
</style>
