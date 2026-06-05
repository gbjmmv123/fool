<script setup lang="ts">
import { NAV_COPY } from '~/data/copy'
interface NavItem {
  label: string
  to: string
  badge?: number
}

interface Props {
  items: NavItem[]
}

const props = defineProps<Props>()

const open = ref(false)
const route = useRoute()

function isItemActive(to: string): boolean {
  const p = to.split('?')[0]!.split('#')[0]!
  if (p === '/') return route.path === '/'
  return route.path === p || route.path.startsWith(`${p}/`)
}

const tappingItem = ref<string | null>(null)

async function onItemClick(e: MouseEvent, item: NavItem) {
  e.preventDefault()
  if (tappingItem.value) return // debounce

  tappingItem.value = item.to

  // Wait for tap animation to be visible
  await new Promise(r => setTimeout(r, 280))

  // Navigate while overlay still covers the page
  await navigateTo(item.to)

  // Wait for new page to render
  await nextTick()

  // Now close drawer — new page is already underneath
  open.value = false
  tappingItem.value = null
}

watch(open, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

defineExpose({ open })
</script>

<template>
  <div class="mobile-nav-wrap">
    <button
      type="button"
      class="hamburger-btn"
      :aria-label="open ? '关闭导航' : '打开导航'"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="hamburger" :class="{ 'is-open': open }">
        <span />
        <span />
        <span />
      </span>
    </button>

    <Teleport to="body">
      <Transition name="nav-overlay">
        <div v-if="open" class="nav-overlay">
          <nav class="nav-overlay__nav">
            <NuxtLink
              v-for="(item, i) in items"
              :key="item.to"
              :to="item.to"
              class="nav-overlay__item"
              :class="{
                'is-active': isItemActive(item.to),
                'is-tapping': tappingItem === item.to,
              }"
              @click.prevent="onItemClick($event, item)"
            >
              {{ item.label }}
              <span v-if="item.badge && item.badge > 0" class="nav-overlay__badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
            </NuxtLink>
          </nav>

          <div class="nav-overlay__deco" aria-hidden="true">〇</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ===== Toggle button (sits in header, never moves) ===== */
.mobile-nav-wrap {
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .mobile-nav-wrap {
    display: none;
  }
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--dt-text-title);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.hamburger-btn:focus,
.hamburger-btn:focus-visible {
  outline: none;
}

.hamburger {
  position: relative;
  display: block;
  width: 22px;
  height: 16px;
}

.hamburger span {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;
  background: currentColor;
  border-radius: 2px;
  transform-origin: center;
  transition:
    transform 0.32s cubic-bezier(0.65, 0, 0.35, 1),
    opacity 0.18s ease;
}

.hamburger span:nth-child(1) {
  transform: translateY(calc(-50% - 7px));
}

.hamburger span:nth-child(2) {
  transform: translateY(-50%);
}

.hamburger span:nth-child(3) {
  transform: translateY(calc(-50% + 7px));
}

.hamburger.is-open span:nth-child(1) {
  transform: translateY(-50%) rotate(45deg);
}

.hamburger.is-open span:nth-child(2) {
  opacity: 0;
  transform: translateY(-50%) scaleX(0);
}

.hamburger.is-open span:nth-child(3) {
  transform: translateY(-50%) rotate(-45deg);
}

/* ===== Overlay (starts BELOW header, so header stays put) ===== */
.nav-overlay {
  --nav-h: 68px;
  position: fixed;
  left: 0;
  right: 0;
  top: var(--nav-h);
  bottom: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  background: #080808;
  overflow: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

@media (min-width: 768px) {
  .nav-overlay {
    --nav-h: 72px;
  }
}

.nav-overlay-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-overlay-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.nav-overlay-enter-from,
.nav-overlay-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.nav-overlay-enter-active .nav-overlay__item {
  animation: itemIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: opacity, transform;
  transition: none;
}

@keyframes itemIn {
  0% {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-overlay-enter-active,
  .nav-overlay-leave-active {
    transition-duration: 0.18s;
  }

  .nav-overlay-enter-active .nav-overlay__item {
    animation: none;
  }
}

.nav-overlay__nav {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding: 1rem 2rem 4rem;
}

.nav-overlay__item {
  position: relative;
  display: block;
  padding: 1.05rem 0;
  text-decoration: none;
  color: rgba(241, 237, 230, 0.4);
  font-size: clamp(1.05rem, 4.5vw, 1.45rem);
  letter-spacing: 0.06em;
  font-weight: 300;
  border-bottom: 1px solid rgba(212, 184, 134, 0.07);
  transition:
    color 0.25s ease,
    padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.nav-overlay__item.is-tapping {
  color: var(--dt-text-title);
  padding-left: 1.25rem;
  transition:
    color 0.15s ease,
    padding-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-overlay__item.is-tapping::before {
  height: 50%;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-overlay__item:focus,
.nav-overlay__item:focus-visible {
  outline: none;
}

.nav-overlay__item:last-child {
  border-bottom: none;
}

.nav-overlay__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 2px;
  height: 0;
  background: var(--dt-border-default);
  transform: translateY(-50%);
  transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-overlay__item:hover,
.nav-overlay__item.is-active {
  color: var(--dt-text-title);
  padding-left: 1.25rem;
}

.nav-overlay__item:hover::before,
.nav-overlay__item.is-active::before {
  height: 50%;
}

.nav-overlay__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--dt-state-danger);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  margin-left: 0.6rem;
  vertical-align: middle;
}

.nav-overlay__deco {
  right: -0.5rem;
  bottom: -2rem;
  font-size: clamp(10rem, 40vw, 22rem);
  color: var(--dt-text-title);
  opacity: 0.03;
  pointer-events: none;
  user-select: none;
  font-weight: 700;
  line-height: 1;
}
</style>
