<script setup lang="ts">
import { STAFF_COPY, t } from '~/data/copy'
definePageMeta({
  layout: 'none',
  requiresStaff: true,
})

const staffConsole = useStaffConsole()
const staffFeedback = useStaffFeedback()
const { lock } = useStaffAuth()
const arrodesDraft = useArrodesDraft()
const composerRef = ref<{ setDraft: (draft: string) => void } | null>(null)

type Tab = 'messages' | 'feedback'
const activeTab = ref<Tab>('messages')

onMounted(() => {
  staffConsole.loadList()
  staffConsole.startPolling()
  staffConsole.bindVisibility()
})

onUnmounted(() => {
  staffConsole.stopPolling()
  staffConsole.unbindVisibility()
})

// 当管理端选中会话或轮询到新 pendingDraft 时，自动填入编辑器
watch(() => staffConsole.pendingDraft.value, (draft) => {
  if (draft && composerRef.value) {
    composerRef.value.setDraft(draft)
  }
})

function switchTab(tab: Tab) {
  activeTab.value = tab
  if (tab === 'feedback') {
    staffFeedback.loadFeedbacks()
  }
}

function handleLogout() {
  lock()
  navigateTo('/')
}

async function handleArrodesDraft() {
  try {
    const result = await arrodesDraft.generateDraft(
      staffConsole.activeUserId.value!,
      staffConsole.messages.value,
    )
    if (result && composerRef.value) {
      composerRef.value.setDraft(result)
    }
  } catch {
    // error already set in composable
  }
}
</script>

<template>
  <div class="staff-shell">
    <div class="staff-shell__header">
      <span class="staff-shell__title">{{ STAFF_COPY.title }}</span>
      <div class="staff-shell__tabs">
        <button
          class="staff-tab"
          :class="{ 'staff-tab--active': activeTab === 'messages' }"
          type="button"
          @click="switchTab('messages')"
        >
          消息
        </button>
        <button
          class="staff-tab"
          :class="{ 'staff-tab--active': activeTab === 'feedback' }"
          type="button"
          @click="switchTab('feedback')"
        >
          用户反馈
        </button>
      </div>
      <button class="staff-shell__logout" type="button" @click="handleLogout">{{ STAFF_COPY.logout }}</button>
    </div>

    <!-- Messages view -->
    <div v-show="activeTab === 'messages'" class="staff-shell__body">
      <aside
        class="staff-shell__sidebar"
        :class="{ 'staff-shell__sidebar--hidden': !!staffConsole.activeUserId.value }"
      >
        <StaffConversationList
          :items="staffConsole.conversations.value"
          :active-user-id="staffConsole.activeUserId.value"
          @select="staffConsole.selectConversation"
        />
      </aside>
      <main
        class="staff-shell__main"
        :class="{ 'staff-shell__main--hidden': !staffConsole.activeUserId.value }"
      >
        <template v-if="staffConsole.activeUserId.value">
          <StaffMessageList :messages="staffConsole.messages.value" />
          <div class="staff-shell__draft-bar">
            <button
              class="staff-draft-btn"
              type="button"
              :disabled="arrodesDraft.drafting.value || staffConsole.sending.value"
              @click="handleArrodesDraft"
            >
              {{ arrodesDraft.drafting.value ? STAFF_COPY.draftBtnLoading : STAFF_COPY.draftBtn }}
            </button>
            <span v-if="arrodesDraft.error.value" class="staff-draft-error">{{ arrodesDraft.error.value }}</span>
            <span v-if="staffConsole.pendingDraft.value" class="staff-draft-auto-tip">AI草稿已填入</span>
          </div>
          <StaffComposer
            ref="composerRef"
            :sending="staffConsole.sending.value"
            @send="staffConsole.reply"
          />
        </template>
        <div v-else class="staff-shell__empty">
          <span>{{ STAFF_COPY.noConversation }}</span>
        </div>
      </main>
    </div>

    <!-- Feedback view -->
    <div v-show="activeTab === 'feedback'" class="staff-shell__feedback">
      <div class="staff-feedback__header">
        <span class="staff-feedback__count">
          {{ t(STAFF_COPY.feedbackCount, { count: staffFeedback.feedbacks.value.length }) }}
        </span>
        <button
          class="staff-feedback__refresh"
          type="button"
          :disabled="staffFeedback.loading.value"
          @click="staffFeedback.loadFeedbacks()"
        >
          {{ staffFeedback.loading.value ? STAFF_COPY.feedbackLoading : STAFF_COPY.feedbackRefresh }}
        </button>
      </div>
      <StaffFeedbackList
        :items="staffFeedback.feedbacks.value"
        :loading="staffFeedback.loading.value"
        :error="staffFeedback.error.value"
      />
    </div>
  </div>
</template>

<style scoped>
.staff-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--dt-bg-base);
  color: var(--dt-text-body);
  font-family: inherit;
  overflow: hidden;
}

.staff-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  height: 52px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--dt-border-subtle);
  background: rgba(18, 18, 18, 0.95);
  gap: 1rem;
}

.staff-shell__title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--dt-text-title);
  flex-shrink: 0;
}

.staff-shell__tabs {
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 3px;
}

.staff-tab {
  padding: 0.28rem 0.85rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--dt-text-muted);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font-family: inherit;
}

.staff-tab:hover {
  color: var(--dt-text-body);
}

.staff-tab--active {
  background: rgba(212, 184, 134, 0.12);
  color: var(--dt-text-title);
}

.staff-shell__logout {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: color 0.15s;
  flex-shrink: 0;
}

.staff-shell__logout:hover {
  color: var(--dt-text-body);
}

/* Messages layout */
.staff-shell__body {
  display: grid;
  grid-template-columns: 300px 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.staff-shell__sidebar {
  border-right: 1px solid var(--dt-border-subtle);
  overflow-y: auto;
  overflow-x: hidden;
}

.staff-shell__main {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.staff-shell__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dt-text-muted);
  font-size: 0.9rem;
}

/* Feedback layout */
.staff-shell__feedback {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.staff-feedback__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--dt-border-subtle);
  flex-shrink: 0;
}

.staff-feedback__count {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.04em;
}

.staff-feedback__refresh {
  font-size: 0.78rem;
  color: var(--dt-text-muted);
  background: none;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 6px;
  padding: 0.2rem 0.65rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
}

.staff-feedback__refresh:hover:not(:disabled) {
  color: var(--dt-text-body);
  border-color: var(--dt-border-default);
}

.staff-feedback__refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile */
@media (max-width: 768px) {
  .staff-shell__body {
    grid-template-columns: 1fr;
  }

  .staff-shell__sidebar {
    border-right: none;
    border-bottom: 1px solid var(--dt-border-subtle);
  }

  .staff-shell__sidebar--hidden {
    display: none;
  }

  .staff-shell__main--hidden {
    display: none;
  }
}

/* AI Draft toolbar */
.staff-shell__draft-bar {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--dt-border-subtle);
  background: rgba(18, 18, 18, 0.6);
}

.staff-draft-btn {
  padding: 0.35rem 0.85rem;
  background: rgba(212, 184, 134, 0.1);
  border: 1px solid rgba(212, 184, 134, 0.3);
  border-radius: 6px;
  color: var(--dt-text-title);
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.staff-draft-btn:hover:not(:disabled) {
  background: rgba(212, 184, 134, 0.2);
  border-color: rgba(212, 184, 134, 0.5);
}

.staff-draft-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.staff-draft-error {
  font-size: 0.75rem;
  color: var(--dt-state-danger);
}

.staff-draft-auto-tip {
  font-size: 0.72rem;
  color: var(--dt-state-success);
  letter-spacing: 0.05em;
  opacity: 0.8;
}
</style>
