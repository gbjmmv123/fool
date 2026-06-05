<script setup lang="ts">
import { STAFF_COPY } from '~/data/copy'
import type { FeedbackItem } from '~/types/feedback'

defineProps<{
  items: FeedbackItem[]
  loading: boolean
  error: string | null
}>()

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="feedback-list">
    <div v-if="loading" class="feedback-list__state">加载中…</div>
    <div v-else-if="error" class="feedback-list__state feedback-list__state--error">{{ error }}</div>
    <div v-else-if="items.length === 0" class="feedback-list__state">暂无用户反馈</div>
    <ul v-else class="feedback-list__items">
      <li v-for="item in items" :key="item.id" class="feedback-item">
        <div class="feedback-item__meta">
          <span class="feedback-item__user">{{ item.userId ?? '匿名用户' }}</span>
          <span class="feedback-item__time">{{ formatTime(item.createdAt) }}</span>
        </div>
        <p class="feedback-item__content">{{ item.content }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.feedback-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.feedback-list__state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--dt-text-muted);
  font-size: 0.88rem;
}

.feedback-list__state--error {
  color: var(--dt-state-danger);
}

.feedback-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feedback-item {
  padding: 0.9rem 1rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.15s ease;
}

.feedback-item:hover {
  border-color: color-mix(in srgb, var(--dt-border-default) 30%, transparent);
}

.feedback-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.feedback-item__user {
  font-size: 0.72rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.04em;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.feedback-item__time {
  font-size: 0.7rem;
  color: color-mix(in srgb, var(--dt-text-muted) 70%, transparent);
  flex-shrink: 0;
}

.feedback-item__content {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--dt-text-body);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
