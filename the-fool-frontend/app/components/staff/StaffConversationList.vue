<script setup lang="ts">
import { STAFF_COPY, t } from '~/data/copy'
import type { StaffConversation } from '~/types/support'

const props = defineProps<{
  items: StaffConversation[]
  activeUserId: string | null
}>()

const emit = defineEmits<{
  select: [userId: string]
}>()

function displayName(item: StaffConversation): string {
  if (item.nickname) return item.nickname
  return STAFF_COPY.anonymousPrefix + item.userId.slice(-6)
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return STAFF_COPY.timeJustNow
  if (mins < 60) return t(STAFF_COPY.timeMinutesAgo, { n: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t(STAFF_COPY.timeHoursAgo, { n: hours })
  const days = Math.floor(hours / 24)
  return t(STAFF_COPY.timeDaysAgo, { n: days })
}
</script>

<template>
  <div class="conv-list">
    <div v-if="items.length === 0" class="conv-list__empty">{{ STAFF_COPY.noConversations }}</div>
    <button
      v-for="item in items"
      :key="item.userId"
      class="conv-item"
      :class="{ 'conv-item--active': item.userId === activeUserId }"
      type="button"
      @click="emit('select', item.userId)"
    >
      <span v-if="item.needsReply" class="conv-item__dot" :aria-label="STAFF_COPY.needsReply" />
      <div class="conv-item__body">
        <div class="conv-item__top">
          <span class="conv-item__name">{{ displayName(item) }}</span>
          <span class="conv-item__time">{{ relativeTime(item.lastMessageAt) }}</span>
        </div>
        <div class="conv-item__preview">{{ item.lastMessagePreview || '暂无消息' }}</div>
      </div>
    </button>
  </div>
</template>

<style scoped>
.conv-list {
  padding: 0.5rem 0;
}

.conv-list__empty {
  padding: 1.5rem 1rem;
  font-size: 0.85rem;
  color: var(--dt-text-muted);
  text-align: center;
}

.conv-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--dt-border-subtle);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  color: var(--dt-text-body);
}

.conv-item:hover {
  background: var(--dt-bg-hover);
}

.conv-item--active {
  background: rgba(212, 184, 134, 0.08);
  border-left: 2px solid var(--dt-border-default);
}

.conv-item__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dt-state-danger);
  margin-top: 6px;
  box-shadow: 0 0 6px rgba(209, 107, 107, 0.6);
}

.conv-item__body {
  flex: 1;
  min-width: 0;
}

.conv-item__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.conv-item__name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--dt-text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-item__time {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--dt-text-muted);
}

.conv-item__preview {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
