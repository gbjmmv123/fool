<script setup lang="ts">
import type { SupportMessage } from '~/types/support'

const props = defineProps<{
  messages: SupportMessage[]
}>()

const listEl = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (listEl.value) {
      listEl.value.scrollTop = listEl.value.scrollHeight
    }
  })
}

watch(() => props.messages.length, scrollToBottom)
onMounted(scrollToBottom)

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}
</script>

<template>
  <div ref="listEl" class="msg-list">
    <div v-if="messages.length === 0" class="msg-list__empty">暂无消息</div>
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="msg-row"
      :class="msg.role === 'staff' ? 'msg-row--staff' : 'msg-row--user'"
    >
      <div class="msg-bubble">
        <span class="msg-bubble__role">{{ msg.role === 'staff' ? '我' : '用户' }}</span>
        <p class="msg-bubble__content">{{ msg.content }}</p>
        <span class="msg-bubble__time">{{ formatTime(msg.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.msg-list__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dt-text-muted);
  font-size: 0.85rem;
}

.msg-row {
  display: flex;
}

.msg-row--staff {
  justify-content: flex-end;
}

.msg-row--user {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 68%;
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.msg-row--staff .msg-bubble {
  background: rgba(212, 184, 134, 0.18);
  border: 1px solid rgba(212, 184, 134, 0.3);
  border-bottom-right-radius: 4px;
}

.msg-row--user .msg-bubble {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--dt-border-subtle);
  border-bottom-left-radius: 4px;
}

.msg-bubble__role {
  font-size: 0.7rem;
  color: var(--dt-text-muted);
  font-weight: 500;
}

.msg-bubble__content {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--dt-text-body);
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-bubble__time {
  font-size: 0.68rem;
  color: var(--dt-text-muted);
  align-self: flex-end;
}
</style>
