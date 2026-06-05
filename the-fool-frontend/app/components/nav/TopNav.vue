<script setup lang="ts">
import { NAV_COPY } from '~/data/copy'
import MobileNavDrawer from '~/components/nav/MobileNavDrawer.vue'
import TopNavItem from '~/components/nav/TopNavItem.vue'

interface NavItem {
  label: string
  to: string
  badge?: number
}

const { state: amonState } = useAmonMode()
const { state: bootstrapState } = useBootstrap()
const { unlocked } = useStaffAuth()
const { openStaffPasswordDialog } = useDialog()
const { unread, startPolling, stopPolling, bindVisibility, unbindVisibility } = useSupport()
const router = useRouter()

const examItem = computed<NavItem>(() => {
  const s = bootstrapState.value
  if (s.hasCompletedExam && s.latestExamResultId) {
    return { label: '笔试结果', to: `/exam/result?resultId=${encodeURIComponent(s.latestExamResultId)}` }
  }
  return { label: '入会笔试', to: '/exam' }
})

const items = computed<NavItem[]>(() => {
  const supportBadge = unread.value > 0 ? unread.value : undefined
  const base: NavItem[] = [
    { label: '主页', to: '/' },
    { label: '了解愚者教会', to: '/about' },
    { label: '小镜子客服', to: '/support', badge: supportBadge },
    { label: '全部部门', to: '/departments' },
    examItem.value,
    { label: '我的工牌', to: '/badge' },
  ]
  if (amonState.value.showAmonNav) {
    base.push({ label: '阿蒙家族', to: '/amon' })
  }
  base.push({ label: '关于本站', to: '/site' })
  if (!bootstrapState.value.hasCompletedExam) {
    return base.slice(0, 2)
  }
  return base
})

// Start polling for support messages once exam is completed
watch(
  () => bootstrapState.value.hasCompletedExam,
  (hasCompleted) => {
    if (!import.meta.client || !hasCompleted) return
    startPolling()
    bindVisibility()
  },
  { immediate: true }
)

onUnmounted(() => {
  stopPolling()
  unbindVisibility()
})

// --- logo secret tap ---
const clickCount = ref(0)
const lastClickAt = ref(0)
const mobileDrawerRef = ref<InstanceType<typeof MobileNavDrawer> | null>(null)
const CLICK_WINDOW_MS = 800
const REQUIRED_CLICKS = 10

async function onLogoClick(e: MouseEvent) {
  const now = Date.now()
  if (now - lastClickAt.value > CLICK_WINDOW_MS) {
    clickCount.value = 1
  } else {
    clickCount.value += 1
  }
  lastClickAt.value = now

  if (clickCount.value >= REQUIRED_CLICKS) {
    clickCount.value = 0
    e.preventDefault()
    if (unlocked.value) {
      router.push('/__staff/support')
    } else {
      const ok = await openStaffPasswordDialog()
      if (ok) router.push('/__staff/support')
    }
  }

  // On mobile, close the nav drawer if it is open
  if (mobileDrawerRef.value?.open) {
    mobileDrawerRef.value.open = false
  }
}
</script>

<template>
  <header class="top-nav">
    <NuxtLink to="/" class="brand" @click.capture="onLogoClick">
      <img src="/logo.png" alt="" class="brand__logo" draggable="false">
      <div class="brand__text">
        <span class="brand__title" >愚者教会</span>
        <span class="brand__subtitle">Church of the Fool</span>
      </div>
    </NuxtLink>

    <nav class="top-nav__desktop" aria-label="主导航">
      <TopNavItem
        v-for="item in items"
        :key="item.to"
        :label="item.label"
        :to="item.to"
        :badge="item.badge"
      />
    </nav>

    <MobileNavDrawer ref="mobileDrawerRef" :items="items" />
  </header>
</template>

<style scoped>

  .font-wanshi   { font-family: 'WanShiQuanXing', serif; }
.font-guangliang { font-family: 'GuangLiangGanBei', serif; }
.brand {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-decoration: none;
  color: var(--dt-text-title);
  transition: opacity 0.2s ease;
}

.brand:hover {
  opacity: 0.85;
}

.brand__logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;

  filter: brightness(0) saturate(100%) invert(83%) sepia(18%) saturate(450%) hue-rotate(356deg) brightness(94%) contrast(88%);
}

.brand__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.1;
}

.brand__title {
  margin-top: 3px;

  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--dt-text-title);
}

.brand__subtitle {
  margin-top: 2px;
  font-size: 0.625rem;
  letter-spacing: 0.22em;
  color: var(--dt-text-muted);
  text-transform: uppercase;
  font-weight: 400;
}

.top-nav__desktop {
  display: none;
  align-items: center;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .top-nav__desktop {
    display: flex;
  }

  .brand__logo {
    width: 42px;
    height: 42px;
  }

  .brand__title {
    font-size: 1.125rem;
  }

  .brand__subtitle {
    font-size: 0.6875rem;
  }
}
</style>
