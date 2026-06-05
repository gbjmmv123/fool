<script setup lang="ts">
import { DEPARTMENT_COPY, t } from '~/data/copy'
import type { DepartmentDetail } from '~/types/department'

const props = defineProps<{
  items: DepartmentDetail[]
  currentUserId?: string | null
}>()

const expandedIds = ref<Set<string>>(new Set())
const headerRefs: Record<string, HTMLElement> = {}

async function toggle(id: string) {
  const header = headerRefs[id]
  const prevTop = header?.getBoundingClientRect().top ?? 0

  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  // trigger reactivity
  expandedIds.value = new Set(expandedIds.value)

  await nextTick()

  if (header) {
    const newTop = header.getBoundingClientRect().top
    window.scrollBy({ top: newTop - prevTop, behavior: 'instant' })
  }
}

function sortedMembers(dept: DepartmentDetail) {
  return [...dept.members].sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
  )
}

function formatDate(value: string) {
  const d = new Date(value)
  const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date} ${time}`
}
</script>

<template>
  <div class="accordion">
    <div
      v-for="dept in items"
      :key="dept.id"
      class="accordion__item"
    >
      <button
        :ref="(el) => { if (el) headerRefs[dept.id] = el as HTMLElement }"
        class="accordion__header"
        :aria-expanded="expandedIds.has(dept.id)"
        @click="toggle(dept.id)"
      >
        <span class="accordion__name">{{ dept.name }}{{ DEPARTMENT_COPY.deptSuffix }}</span>
        <span class="accordion__meta">{{ dept.memberCount }} {{ DEPARTMENT_COPY.memberCountSuffix }}</span>
        <span class="accordion__icon" :class="{ 'is-open': expandedIds.has(dept.id) }" aria-hidden="true">▼</span>
      </button>
      <div class="accordion__body" :class="{ 'is-open': expandedIds.has(dept.id) }">
        <div class="accordion__inner">
          <div class="accordion__content">
            <div
              v-for="member in sortedMembers(dept)"
              :key="member.userId"
              class="member-row"
              :class="{ 'is-me': member.userId === props.currentUserId }"
            >
              <span class="member-name">
                {{ member.nickname }}
                <span v-if="member.userId === props.currentUserId" class="member-badge">{{ DEPARTMENT_COPY.meBadge }}</span>
              </span>
              <span class="member-date">{{ formatDate(member.joinedAt) }}</span>
            </div>
            <p v-if="dept.members.length === 0" class="member-empty">{{ DEPARTMENT_COPY.noMembers }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accordion__item {
  border: 1px solid var(--dt-border-subtle);
  border-radius: var(--dt-radius-card);
  overflow: hidden;
  background: var(--dt-bg-elevated);
}

.accordion__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  text-align: left;
  cursor: pointer;
  background: transparent;
  color: var(--dt-text-body);
  transition: background 0.2s ease;
}

.accordion__header:hover {
  background: rgba(212, 184, 134, 0.04);
}

.accordion__header:active {
  background: rgba(212, 184, 134, 0.08);
}

.accordion__name {
  flex: 1;
  font-size: 1rem;
  color: var(--dt-text-heading);
}

.accordion__meta {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
}

.accordion__icon {
  font-size: 0.65rem;
  color: var(--dt-text-muted);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion__icon.is-open {
  transform: rotate(180deg);
}

.accordion__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion__body.is-open {
  grid-template-rows: 1fr;
}

.accordion__inner {
  overflow: hidden;
  min-height: 0;
}

.accordion__content {
  padding: 0.75rem 1.25rem 1rem;
  display: flex;
  flex-direction: column;
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--dt-border-subtle);
  gap: 1rem;
}

.member-row:last-child {
  border-bottom: none;
}

.member-row.is-me .member-name {
  color: var(--dt-text-title);
}

.member-name {
  font-size: 0.9rem;
  color: var(--dt-text-body);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  line-height: 1;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background: rgba(212, 184, 134, 0.15);
  color: var(--dt-text-title);
  border: 1px solid rgba(212, 184, 134, 0.3);
}

.member-date {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.member-empty {
  font-size: 0.875rem;
  color: var(--dt-text-muted);
  padding: 0.5rem 0;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .accordion__body {
    transition: none;
  }
  .accordion__icon {
    transition: none;
  }
}
</style>
