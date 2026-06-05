<script setup lang="ts">
import { PAGE_META, AMON_COPY, COMMON, t } from '~/data/copy'
definePageMeta({ title: '阿蒙家族', showTopNav: true })

const { state, initialized, refresh } = useBootstrap()
const { state: amonState } = useAmonMode()
const { userId } = useUserIdentity()
const { showMessage } = useMessage()
const router = useRouter()

const members = ref<import('~/types/amon').AmonMember[]>([])
const loading = ref(true)
const joining = ref(false)

onMounted(async () => {
  if (!initialized.value) {
    try { await refresh() } catch { /* ignore */ }
  }
  loading.value = false
})

// Load members when joined
watch(() => state.value.joinedAmonFamily, async (joined) => {
  if (joined) {
    try {
      const res = await import('~/services/amon').then(m => m.fetchAmonMembers())
      members.value = res.members
    } catch { /* ignore */ }
  }
}, { immediate: true })

async function handleJoin() {
  const id = userId.value
  if (!id || joining.value) return

  showMessage({
    text: '周遭一片死寂\n一声轻笑自脑海中传来，语调慵懒悠然：\n"欢迎来到阿蒙家族。"',
    duration: 4000,
  })

  joining.value = true
  try {
    await import('~/services/amon').then(m => m.joinAmon(id))
    await refresh(true)
  } catch {
    showMessage({ text: '加入失败，请重试', color: 'var(--dt-state-danger)', duration: 3000 })
  } finally {
    joining.value = false
  }
}

async function handleLeave() {
  const id = userId.value
  if (!id) return
  try {
    await import('~/services/amon').then(m => m.leaveAmon(id))
    await refresh(true)
    showMessage({ text: '右眼的单片眼镜突然消失了', duration: 4000 })
    router.push('/')
  } catch {
    showMessage({ text: '退出失败，请重试', color: 'var(--dt-state-danger)', duration: 3000 })
  }
}

function formatJoinedAt(ts: number): string {
  const now = new Date()
  const d = new Date(ts)

  // Get calendar date in East-8
  const fmtTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${h}:${min}`
  }

  const toDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const todayKey = toDateKey(now)
  const targetKey = toDateKey(d)
  if (targetKey === todayKey) {
    return `今日 ${fmtTime(d)}`
  }

  // Calculate day diff via calendar dates
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((todayStart.getTime() - targetStart.getTime()) / 86400000)

  if (diffDays === 1) {
    return `昨天 ${fmtTime(d)}`
  }
  if (diffDays === 2) {
    return `前天 ${fmtTime(d)}`
  }

  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  if (diffDays >= 3 && diffDays <= 6) {
    return `${weekNames[d.getDay()]} ${fmtTime(d)}`
  }

  // Beyond 7 days
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${m}/${day} ${fmtTime(d)}`
}

function handleRun() {
  router.push('/')
}
</script>

<template>
  <MainContent
    :title="AMON_COPY.title"
    description=""
    :class="amonState.amonThemeClass"
  >
    <!-- Loading -->
    <div v-if="loading" class="amon-state">
      <p class="amon-state__text">{{ COMMON.loading }}</p>
    </div>

    <!-- NOT JOINED: Recruitment view -->
    <template v-else-if="!state.joinedAmonFamily">
      <div class="amon-recruit">
        <div class="amon-recruit__image-wrap">
          <div class="amon-recruit__glow" />
          <img
            src="/static/avatars/amon.png"
            alt="阿蒙"
            class="amon-recruit__img"
          />
        </div>
        <p class="amon-recruit__text">{{ AMON_COPY.recruitPrompt }}</p>
        <div class="amon-recruit__actions">
          <button class="amon-recruit__btn" @click="handleRun">
            跑了跑了
          </button>
          <button
            class="amon-recruit__btn amon-recruit__btn--join"
            :disabled="joining"
            @click="handleJoin"
          >
            {{ joining ? COMMON.submitting : AMON_COPY.recruitAccept }}
          </button>
        </div>
      </div>
    </template>

    <!-- JOINED: Member list -->
    <template v-else>
      <section class="amon-members">
        <h2 class="amon-members__title">{{ AMON_COPY.membersTitle }}</h2>
        <div v-if="members.length === 0" class="amon-state">
          <p class="amon-state__text">{{ AMON_COPY.noMembers }}</p>
        </div>
        <div v-else class="amon-members__list">
          <div
            v-for="m in members"
            :key="m.userId"
            class="amon-member-row"
          >
            <span class="amon-member-row__name">{{ m.nickname }}</span>
            <span class="amon-member-row__time">{{ formatJoinedAt(m.joinedAt) }}</span>
          </div>
        </div>
      </section>

      <!-- Easter egg: leave Amon -->
      <button class="amon-leave" @click="handleLeave">
        救救我愚者先生
      </button>
    </template>
  </MainContent>
</template>

<style scoped>
/* --- Common state --- */
.amon-state {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}
.amon-state__text {
  color: var(--dt-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

/* --- Recruitment view --- */
.amon-recruit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
  overflow: visible;
}

.amon-recruit__image-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 240px;
  height: 240px;
  padding: 2rem 0 2.5rem;
  overflow: visible;
  isolation: isolate;
}

.amon-recruit__glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 340px;
  height: 420px;
  border-radius: 50%;
  transform: translate(-50%, -52%);
  background: radial-gradient(
    ellipse at 50% 60%,
    rgba(212, 184, 134, 0.28) 0%,
    rgba(212, 184, 134, 0.16) 32%,
    rgba(212, 184, 134, 0.07) 58%,
    rgba(212, 184, 134, 0.02) 74%,
    transparent 86%
  );
  filter: blur(36px);
  pointer-events: none;
}

.amon-recruit__img {
  position: relative;
  z-index: 1;
  width: 220px;
  height: 220px;
  object-fit: contain;
  object-position: bottom;
  opacity: 0.8;
  filter: drop-shadow(0 0 32px rgba(212, 184, 134, 0.3));
}

.amon-recruit__text {
  font-size: 1.2rem;
  letter-spacing: 0.08em;
  color: var(--dt-text-title);
  text-shadow:
    0 0 24px rgba(212, 184, 134, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.8);
  margin: 0;
  text-align: center;
}

.amon-recruit__actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.amon-recruit__btn {
  min-width: 140px;
  padding: 0.6rem 1.5rem;
  border-radius: var(--dt-radius-card);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid var(--dt-border-default);
  background: transparent;
  color: var(--dt-text-muted);
  border-color: var(--dt-border-subtle);
}

.amon-recruit__btn:hover {
  color: var(--dt-text-title);
  border-color: var(--dt-border-default);
}

.amon-recruit__btn--join {
  background: rgba(212, 184, 134, 0.1);
  color: var(--dt-text-title);
  border-color: rgba(212, 184, 134, 0.3);
}

.amon-recruit__btn--join:hover {
  background: rgba(212, 184, 134, 0.2);
  border-color: rgba(212, 184, 134, 0.5);
  box-shadow: 0 0 20px rgba(212, 184, 134, 0.15);
}

.amon-recruit__btn--join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- Member list --- */
.amon-members {
  margin-top: 1rem;
}

.amon-members__title {
  font-size: 1.1rem;
  color: var(--dt-text-heading);
  margin: 0 0 1.5rem 0;
  letter-spacing: 0.06em;
}

.amon-members__list {
  display: flex;
  flex-direction: column;
}

.amon-member-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.amon-member-row:last-child {
  border-bottom: none;
}

.amon-member-row__name {
  font-size: 0.95rem;
  color: var(--dt-text-title);
  letter-spacing: 0.04em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amon-member-row__time {
  font-size: 0.78rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.03em;
  flex-shrink: 0;
  margin-left: 1rem;
}

/* --- Leave easter egg --- */
.amon-leave {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 10;
  background: none;
  border: none;
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #FFD700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: color 0.4s ease, text-shadow 0.4s ease;
  animation: amon-leave-breathe 3s ease-in-out infinite;
}

.amon-leave::before {
  content: '';
  position: absolute;
  inset: -36px -24px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 50%,
    rgba(255, 215, 0, 0.28) 0%,
    rgba(255, 215, 0, 0.08) 45%,
    transparent 70%
  );
  filter: blur(22px);
  z-index: -1;
  animation: amon-leave-glow 3.2s ease-in-out infinite;
}

.amon-leave:hover {
  color: #FFF8DC;
  text-shadow:
    0 0 14px rgba(255, 215, 0, 0.8),
    0 0 28px rgba(255, 215, 0, 0.4);
}

@keyframes amon-leave-breathe {
  0%, 100% {
    text-shadow:
      0 0 8px rgba(255, 215, 0, 0.4),
      0 0 20px rgba(255, 215, 0, 0.2);
    opacity: 0.65;
  }
  50% {
    text-shadow:
      0 0 18px rgba(255, 215, 0, 0.7),
      0 0 36px rgba(255, 215, 0, 0.35),
      0 0 54px rgba(255, 215, 0, 0.15);
    opacity: 1;
  }
}

@keyframes amon-leave-glow {
  0%, 100% {
    transform: scale(0.88);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.95;
  }
}
</style>
