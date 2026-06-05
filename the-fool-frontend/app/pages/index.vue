<script setup lang="ts">
import { DEPARTMENT_DATA } from '~/data/departments'
import type { DepartmentId } from '~/types/department'
import { updateUserProfile } from '~/services/user'
import { PAGE_META, HOME, COMMON } from '~/data/copy'
import { fetchExamResult } from '~/services/exam'

definePageMeta({
  title: PAGE_META.home,
  showTopNav: true,
})

const { state, loading, error, initialized, refresh, patchState } = useBootstrap()
const { view } = useHomeView()
const { openNameInputDialog, openShareCardDialog } = useDialog()
const { userId } = useUserIdentity()
const reducedMotion = useReducedMotion()
const welcomeShown = useState<Set<string>>('church-welcome-shown', () => new Set())
const LAST_WELCOME_KEY = 'church_last_welcome_key'
const heroReady = ref(false)
const heroActive = ref(true)
const heroReplayKey = ref(0)
const heroTitleChars = HOME.churchName.split('')
const isCompleted = computed(() => state.value.hasCompletedExam && !!state.value.latestExamResultId)
const HERO_RETURN_DELAY_MS = 420
const DESKTOP_BP = 1024
const isDesktop = ref(false)

let heroReplayTimer: ReturnType<typeof setTimeout> | null = null

function clearHeroReplayTimer() {
  if (!heroReplayTimer) return
  clearTimeout(heroReplayTimer)
  heroReplayTimer = null
}

function startHeroReveal(force = false, delay = 0) {
  clearHeroReplayTimer()
  if (heroReady.value && heroActive.value && !force && delay === 0) return
  if (reducedMotion.value) {
    heroActive.value = true
    heroReady.value = true
    return
  }
  heroActive.value = delay === 0
  heroReady.value = false
  heroReplayKey.value += 1
  heroReplayTimer = setTimeout(() => {
    heroActive.value = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroReady.value = true
      })
    })
  }, delay)
}

onMounted(() => {
  if (import.meta.client) {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BP}px)`)
    isDesktop.value = mq.matches
    mq.addEventListener('change', (e) => { isDesktop.value = e.matches })
  }

  if (!loading.value && !error.value) {
    startHeroReveal(true)
  }
  if (initialized.value) {
    if (!error.value) {
      runWelcomeFlow()
    }
    return
  }
  const stop = watch(initialized, (val) => {
    if (val) {
      stop()
      if (!error.value) {
        runWelcomeFlow()
      }
    }
  })
})

async function runWelcomeFlow() {
  const intent = view.value.welcomeIntent
  if (intent.type === 'none') return
  if (intent.type === 'name') {
    const result = await openNameInputDialog()
    if (!result) return
    const id = userId.value
    if (!id) return
    try {
      await updateUserProfile(id, result.nickname)
      patchState({ nickname: result.nickname, isNewUser: false, homepageMessageType: 'none' })
    } catch {}
    return
  }
  if (!intent.dedupeKey) return
  const last = import.meta.client ? localStorage.getItem(LAST_WELCOME_KEY) : null
  if (last === intent.dedupeKey) return
  if (welcomeShown.value.has(intent.dedupeKey)) return
  welcomeShown.value.add(intent.dedupeKey)
  if (import.meta.client) localStorage.setItem(LAST_WELCOME_KEY, intent.dedupeKey)
}

// Cards section
const departmentIds = Object.keys(DEPARTMENT_DATA) as DepartmentId[]
const currentIndex = ref(0)
const currentId = computed(() => departmentIds[currentIndex.value])

function goToResult() {
  const id = state.value.latestExamResultId
  if (!id) return
  navigateTo({ path: '/exam/result', query: { resultId: id } })
}

function goToPrimaryAction() {
  if (isCompleted.value) {
    goToResult()
    return
  }
  navigateTo('/exam')
}

const sharing = ref(false)
async function handleShare() {
  const id = state.value.latestExamResultId
  if (!id || sharing.value) return
  const uid = userId.value
  if (!uid) return
  sharing.value = true
  try {
    const result = await fetchExamResult(uid, id)
    await openShareCardDialog(result)
  } catch {
  } finally {
    sharing.value = false
  }
}

function selectIndex(i: number) {
  currentIndex.value = i
}
function prev() {
  currentIndex.value = (currentIndex.value - 1 + departmentIds.length) % departmentIds.length
}
function next() {
  currentIndex.value = (currentIndex.value + 1) % departmentIds.length
}

function handlePrev(e: Event) {
  prev()
  ;(e.currentTarget as HTMLElement).blur()
}
function handleNext(e: Event) {
  next()
  ;(e.currentTarget as HTMLElement).blur()
}

// Mobile swipe on card stage
const cardsStageRef = ref<HTMLElement | null>(null)
let cardSwipeStartX = 0
let cardSwipeStartY = 0
let cardSwipeStartT = 0

function onCardTouchStart(e: TouchEvent) {
  cardSwipeStartX = e.touches[0].clientX
  cardSwipeStartY = e.touches[0].clientY
  cardSwipeStartT = Date.now()
}

function onCardTouchEnd(e: TouchEvent) {
  const dx = cardSwipeStartX - e.changedTouches[0].clientX
  const dy = cardSwipeStartY - e.changedTouches[0].clientY
  const dt = Date.now() - cardSwipeStartT
  // Only trigger when horizontal swipe dominates and exceeds threshold
  if (Math.abs(dx) < 40 || dt > 600) return
  if (Math.abs(dx) < Math.abs(dy)) return
  e.stopPropagation()
  if (dx > 0) next()
  else prev()
}


function clearAllStorage() {
  localStorage.clear()
  sessionStorage.clear()
  window.location.reload()
}
watch(cardsStageRef, (el, _old, onCleanup) => {
  if (!el) return
  el.addEventListener('touchstart', onCardTouchStart, { passive: true })
  el.addEventListener('touchend', onCardTouchEnd, { passive: true })
  onCleanup(() => {
    el.removeEventListener('touchstart', onCardTouchStart)
    el.removeEventListener('touchend', onCardTouchEnd)
  })
})

// Full-page section switching — CSS transform + JS event handling
const snapRef = ref<HTMLElement | null>(null)
const currentSection = ref(0)
const cardsVisible = ref(false)
const cardsKey = ref(0)
let switching = false

// On desktop, always show hero animations and both sections
watch(isDesktop, (val) => {
  if (val) {
    currentSection.value = -1
    heroActive.value = true
    heroReady.value = true
  } else {
    currentSection.value = 0
  }
})


watch(
  () => loading.value,
  (isLoading) => {
    if (isLoading || error.value || currentSection.value !== 0) return
    nextTick(() => {
      startHeroReveal(true)
    })
  },
  { immediate: true }
)

function goToSection(index: number) {
  if (isDesktop.value) return

  if (switching) return
  const target = Math.max(0, Math.min(index, 1))
  if (target === currentSection.value) return
  switching = true
  // Reset cards entrance when leaving section 2
  if (currentSection.value === 1) cardsVisible.value = false
  currentSection.value = target
  setTimeout(() => {
    switching = false
    if (target === 1) {
      cardsKey.value++
      requestAnimationFrame(() => { cardsVisible.value = true })
    }
  }, 250)
}

let lastWheel = 0
const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const now = Date.now()
  if (now - lastWheel < 900) return
  lastWheel = now
  if (e.deltaY > 0) goToSection(currentSection.value + 1)
  else if (e.deltaY < 0) goToSection(currentSection.value - 1)
}

let touchY = 0
const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
const onTouchEnd = (e: TouchEvent) => {
  const dy = touchY - e.changedTouches[0].clientY
  if (Math.abs(dy) < 40) return
  if (dy > 0) goToSection(currentSection.value + 1)
  else goToSection(currentSection.value - 1)
}

watch(snapRef, (el, _old, onCleanup) => {
  if (!el) return
  if (isDesktop.value) return

  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchend', onTouchEnd, { passive: true })
  onCleanup(() => {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchend', onTouchEnd)
  })
})

watch(currentSection, (section) => {
  if (isDesktop.value) return

  if (section === 0) {
    startHeroReveal(true, HERO_RETURN_DELAY_MS)
    return
  }
  clearHeroReplayTimer()
  heroActive.value = true
  heroReady.value = true
})

onUnmounted(() => {
  clearHeroReplayTimer()
})
</script>

<template>
  <!-- Share button: top-right, only when exam completed -->
  <button
    v-if="isCompleted"
    class="share-fab"
    :disabled="sharing"
    aria-label="分享结果"
    @click="handleShare"
  >
    <span class="share-icon" />
    
  </button>
  <MainContent :title="HOME.churchLinkText">
    <div v-if="error" class="bootstrap-error">
      <button class="btn" @click="() => refresh(true)">{{ COMMON.refresh }}</button>
    </div>
    <div v-else-if="loading" class="bootstrap-loading">
      <p>{{ HOME.loadingText }}</p>
    </div>
    <template v-else>
      <div ref="snapRef" class="home-snap">
        <div class="home-sections" :style="{ transform: `translateY(${-currentSection * 100}%)` }">
        <!-- ── Section 1: Hero ── -->
        <section class="home-section home-section--hero" :class="{ 'is-desktop': isDesktop }">
          <div class="hero-center" :class="{ 'is-fading': currentSection !== 0 || !heroActive }">
            <div class="hero-glow" aria-hidden="true" />
            <div :key="heroReplayKey" class="hero-content" :class="{ 'is-ready': heroReady }">
              <img src="/logo.png" alt="" class="hero-brand-logo" draggable="false">
              <div class="hero-font-preview">
                <h1 class="hero-church-name font-guangliang" aria-label="愚者教会">
                  <span
                    v-for="(char, index) in heroTitleChars"
                    :key="`${char}-${index}`"
                    class="hero-church-name__char"
                    :style="{ '--char-index': index }"
                  >{{ char }}</span>
                </h1>
                <p class="hero-church-subtitle" aria-hidden="true">CHURCH OF THE FOOL</p>
              </div>
              <div class="hero-actions">
                <button class="ritual-btn" @click="goToPrimaryAction">
                  <span class="ritual-btn__text">
                    {{ isCompleted ? HOME.examEntryViewResult : HOME.examEntryNotCompleted }}
                  </span>
                </button>
                <NuxtLink to="/about" class="hero-about-link">{{ HOME.churchLinkText }}</NuxtLink>
              </div>
            </div>
          </div>

          <!-- <HomeFogOverlay /> -->

          <!-- Scroll indicator -->
          <div
            v-if="!isDesktop"
            class="scroll-indicator"
            :class="{
              'is-visible': heroReady && heroActive && currentSection === 0,
              'is-hidden': currentSection === 1 || !heroActive,
            }"
            aria-hidden="true"
          >
            <span class="scroll-indicator__label">{{ HOME.scrollDownLabel }}</span>
            <div class="scroll-indicator__arrow">
              <svg width="18" height="28" viewBox="0 0 18 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2 L9 20 M2 13 L9 20 L16 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        <!-- ── Section 2: Cards showcase ── -->
        <section
          class="home-section home-section--cards"
          :class="{ 'is-visible': isDesktop || cardsVisible }"
        >
          <div class="cards-bg-logo" aria-hidden="true" />
          <div class="cards-inner" :key="cardsKey">
            <template v-if="!isDesktop">
            <div class="cards-back-top" aria-hidden="true" @click="goToSection(0)">
              <div class="cards-back-top__arrow">
                <svg width="18" height="28" viewBox="0 0 18 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 26 L9 8 M2 15 L9 8 L16 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="cards-back-top__label">{{ COMMON.backToHome }}</span>
            </div>
            </template>


            <!-- Card with overlaid nav buttons -->
            <div ref="cardsStageRef" class="cards-stage">
              <div class="cards-card-wrap">
                <ResultDetailCard
                  :key="currentId"
                  :department-id="currentId"
                  joined-at="2024-01-01T00:00:00Z"
                  :show-retake="false"
                  :hide-footer="true"
                />
              </div>
              <button
                v-if="currentIndex > 0"
                class="cards-nav cards-nav--prev"
                @click="handlePrev"
                aria-label="上一个"
              >
                <svg width="12" height="22" viewBox="0 0 12 22" fill="none">
                  <path d="M10 2 L2 11 L10 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                v-if="currentIndex < departmentIds.length - 1"
                class="cards-nav cards-nav--next"
                @click="handleNext"
                aria-label="下一个"
              >
                <svg width="12" height="22" viewBox="0 0 12 22" fill="none">
                  <path d="M2 2 L10 11 L2 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <!-- 2×4 department tabs -->
            <div class="cards-tabs">
              <button
                v-for="(id, i) in departmentIds"
                :key="id"
                class="cards-tab"
                :class="{ 'is-active': i === currentIndex }"
                :style="{ '--tab-color': DEPARTMENT_DATA[id].themeColor, '--tab-delay': `${i * 45}ms` }"
                @click="selectIndex(i)"
              >
                {{ DEPARTMENT_DATA[id].name }}
              </button>
            </div>
          </div>
        </section>

        </div><!-- /.home-sections -->
      </div>
      <AmonWatermark />
    </template>
  </MainContent>
</template>

<style scoped>
/* ── Test button ── */

.debug-clear-btn {
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 6px 16px;
  font-size: 13px;
  border: 1px solid rgba(255, 100, 100, 0.4);
  border-radius: 6px;
  background: rgba(30, 10, 10, 0.85);
  color: rgba(255, 150, 150, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.debug-clear-btn:hover {
  background: rgba(50, 10, 10, 0.92);
  border-color: rgba(255, 100, 100, 0.65);
}

/* ── Bootstrap states ── */
.bootstrap-error,
.bootstrap-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--dt-text-muted);
}
.bootstrap-error p { color: var(--dt-state-danger); margin: 0; }

/* ── Override MainContent — body becomes invisible placeholder ── */
:deep(.main-content) { width: 100%; max-width: 100%; margin: 0; }
:deep(.main-content__body) { display: block; gap: 0; }

/* ── Snap container — fixed to viewport ── */
.home-snap {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 2;
}

/* ── Slide track — translateY drives section switching ── */
.home-sections {
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.87, 0, 0.13, 1);
  will-change: transform;
}

.home-section {
  height: 100dvh;
  position: relative;
  overflow: hidden;
}

/* ════════════════════════════════════════
   SECTION 1 — HERO
   ════════════════════════════════════════ */
.home-section--hero {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-center {
  position: relative;
  width: min(100%, 760px);
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(72px + 4vh) 1.5rem 8rem;
  opacity: 1;
  filter: blur(0);
  transform: translateY(-2.5vh);
  transition: opacity 0.46s ease, filter 0.46s ease, transform 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-center.is-fading {
  opacity: 0;
  filter: blur(18px);
  transform: translateY(-12vh);
}

/* Background logo — fills cards section with same faint logo */
.cards-bg-logo {
  position: absolute;
  inset: 0;
  background-image: url('/logo.png');
  background-repeat: no-repeat;
  background-size: contain;
  filter: invert(100%);
  opacity: 0.07;
  pointer-events: none;
  z-index: 0;
  background-position: center 25%
}

/* Glow centered on title area */
.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(112vw, 1080px);
  height: min(112vw, 1080px);
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(212, 184, 134, 0.26) 0%,
    rgba(212, 184, 134, 0.12) 22%,
    rgba(212, 184, 134, 0.07) 50%,
    rgba(212, 184, 134, 0.03) 68%,
    transparent 84%
  );
  opacity: 0.52;
  animation: glow-breathe 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  filter: blur(12px);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.4rem;
}

.hero-content.is-ready .hero-glow {
  opacity: 1;
}

.hero-brand-logo {
  width: clamp(135px, 25vw, 205px);
  height: clamp(135px, 25vw, 205px);
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  filter: brightness(0) saturate(100%) invert(83%) sepia(18%) saturate(450%) hue-rotate(356deg) brightness(94%) contrast(88%);
  opacity: 0;
  transform: translateY(36px) scale(0.92);
  transition:
    opacity 0.46s ease 1.18s,
    transform 0.58s cubic-bezier(0.22, 1, 0.36, 1) 1.18s,
    filter 0.4s ease;
}

.hero-content.is-ready .hero-brand-logo {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.hero-font-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 1.1rem;
}

.hero-church-name {
  --hero-title-dark: color-mix(in srgb, var(--dt-text-title) 72%, black 28%);
  --hero-title-light: color-mix(in srgb, var(--dt-text-title) 78%, white 22%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.12em;
  margin: 0;
  padding: 0 0.12em;
  font-size: clamp(3.65rem, 14.8vw, 6.2rem);
  font-weight: normal;
  color: var(--hero-title-light);
  background: linear-gradient(135deg, var(--hero-title-light) 0%, var(--hero-title-dark) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.08em;
  line-height: 1.05;
  opacity: 0;
  transform: translateY(34px);
  transition:
    opacity 1.02s ease 0.22s,
    transform 1.12s cubic-bezier(0.22, 1, 0.36, 1) 0.22s;
}

.hero-content.is-ready .hero-church-name {
  opacity: 1;
  transform: translateY(0);
}

.hero-church-subtitle {
  margin: 100rem 0 0;
  font-size: clamp(0.72rem, 1.8vw, 1rem);
  font-weight: 300;
  letter-spacing: 0.58em;
  padding-left: 0.58em;
  color: color-mix(in srgb, var(--dt-text-body) 24%, white 28%);
  line-height: 1;
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.6s ease 0.62s,
    transform 0.72s cubic-bezier(0.22, 1, 0.36, 1) 0.62s;
}

.hero-content.is-ready .hero-church-subtitle {
  opacity: 1;
  transform: translateY(0);
}

.hero-church-name__char {
  display: inline-block;
  color: inherit;
  opacity: 1;
  transform: none;
  filter: none;
  text-shadow: none;
}

.font-wanshi   { font-family: 'WanShiQuanXing', serif; }
.font-guangliang { font-family: 'GuangLiangGanBei', serif; }

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  margin-top: 1.35rem;
}

.ritual-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 152px;
  height: 46px;
  border: 1px solid var(--dt-border-default);
  border-radius: 23px;
  background: transparent;
  cursor: pointer;
  outline: none;
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.4s ease 1.38s,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 1.38s,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.ritual-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.ritual-btn:disabled:hover {
  border-color: var(--dt-border-default);
  box-shadow: none;
  transform: none;
}
.ritual-btn:hover {
  border-color: var(--dt-border-highlight);
  box-shadow: 0 0 28px rgba(212, 184, 134, 0.28);
}
.ritual-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.ritual-btn:focus-visible { outline: 2px solid var(--dt-border-active); outline-offset: 3px; }
.hero-content.is-ready .ritual-btn {
  opacity: 1;
  transform: translateY(0);
}
.ritual-btn__text {
  position: relative;
  z-index: 1;
  font-size: 0.88rem;
  letter-spacing: 0.1em;
  color: var(--dt-text-title);
}

.hero-about-link {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: var(--dt-text-muted);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(212, 184, 134, 0.3);
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.36s ease 1.58s,
    transform 0.44s cubic-bezier(0.22, 1, 0.36, 1) 1.58s,
    color 0.2s ease,
    text-decoration-color 0.2s ease;
}
.hero-content.is-ready .hero-about-link {
  opacity: 1;
  transform: translateY(0);
}
.hero-about-link:hover {
  color: var(--dt-text-body);
  text-decoration-color: rgba(212, 184, 134, 0.6);
}

/* Scroll indicator — centered via flex on the section */
.scroll-indicator {
  position: absolute;
  bottom: 2.5rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  z-index: 2;
  pointer-events: none;
}
.scroll-indicator.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 1.78s;
}
.scroll-indicator.is-hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}
.scroll-indicator__label {
  font-size: 0.68rem;
  /* compensate letter-spacing optical shift */
  padding-left: 0.18em;
  letter-spacing: 0.18em;
  color: var(--dt-text-muted);
  opacity: 0.7;
}
.scroll-indicator__arrow {
  color: var(--dt-text-muted);
  opacity: 0.55;
  animation: float-down 2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: 1.75s;
}

@media (max-width: 767px) {
  .hero-center {
    padding: calc(72px + 1.5rem) 1.25rem 7.5rem;
  }

  .hero-content {
    gap: 1.1rem;
  }

  .hero-actions {
    margin-top: 1rem;
  }

  .hero-church-name {
    gap: 0.04em;
    font-size: clamp(3.2rem, 15.6vw, 4.8rem);
  }

  .hero-church-subtitle {
    margin-top: 0.95rem;
    font-size: 0.68rem;
    letter-spacing: 0.42em;
    padding-left: 0.42em;
  }
}

/* Back-to-top indicator — in normal flow at the top of cards-inner */
.cards-back-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;
}
.home-section--cards.is-visible .cards-back-top {
  opacity: 1;
  transform: translateY(0);
}
.cards-back-top__label {
  font-size: 0.68rem;
  padding-left: 0.18em;
  letter-spacing: 0.18em;
  color: var(--dt-text-muted);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.cards-back-top:hover .cards-back-top__label {
  opacity: 1;
}
.cards-back-top__arrow {
  color: var(--dt-text-muted);
  opacity: 0.55;
  animation: float-up 2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: 1.3s;
  transition: opacity 0.2s ease;
}
.cards-back-top:hover .cards-back-top__arrow {
  opacity: 0.85;
}

/* ════════════════════════════════════════
   SECTION 2 — CARDS
   ════════════════════════════════════════ */
.home-section--cards {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: scroll;
  scrollbar-width: none;
}
.home-section--cards::-webkit-scrollbar { display: none; }

.cards-inner {
  width: 100%;
  max-width: 480px;
  padding: calc(68px + 1.75rem) 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .cards-inner { padding-top: calc(72px + 2.5rem); }
}

/* ── Tab grid: 2×4, designed with colored accent bars ── */
.cards-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  width: 100%;
}

.cards-tab {
  position: relative;
  padding: 0.55rem 0.25rem 0.45rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--tab-color) 28%, transparent);
  background: color-mix(in srgb, var(--tab-color) 6%, rgba(14, 14, 14, 0.85));
  color: color-mix(in srgb, var(--tab-color) 60%, var(--dt-text-muted));
  font-size: 0.76rem;
  cursor: pointer;
  letter-spacing: 0.05em;
  text-align: center;
  overflow: hidden;
  transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
  /* entrance animation */
  opacity: 0;
  transform: translateY(12px);
}

/* Colored top accent bar */
.cards-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: var(--tab-color);
  opacity: 0;
  transform: scaleX(0);
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.cards-tab:hover {
  background: color-mix(in srgb, var(--tab-color) 14%, rgba(14, 14, 14, 0.9));
  border-color: color-mix(in srgb, var(--tab-color) 45%, transparent);
  color: color-mix(in srgb, var(--tab-color) 85%, #fff);
}

.cards-tab.is-active {
  background: color-mix(in srgb, var(--tab-color) 18%, rgba(14, 14, 14, 0.95));
  border-color: color-mix(in srgb, var(--tab-color) 65%, transparent);
  color: var(--tab-color);
  box-shadow: 0 0 18px color-mix(in srgb, var(--tab-color) 22%, transparent),
              inset 0 0 12px color-mix(in srgb, var(--tab-color) 8%, transparent);
}
.cards-tab.is-active::before {
  opacity: 1;
  transform: scaleX(1);
}

/* Entrance: triggered by .is-visible on the section */
.home-section--cards.is-visible .cards-tab {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 0.38s ease calc(0.42s + var(--tab-delay)),
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1) calc(0.42s + var(--tab-delay)),
    background 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease;
}

/* ── Card stage ── */
.cards-stage {
  position: relative;
  width: 100%;
  /* entrance — card leads, tabs follow */
  opacity: 0;
  transform: translateY(24px) scale(0.97);
  transition: opacity 0.5s ease 0.08s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s;
}

.home-section--cards.is-visible .cards-stage {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.cards-card-wrap { width: 100%; }

/* Overlaid semi-transparent nav buttons */
.cards-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 12, 12, 0.22);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(212, 184, 134, 0.07);
  border-radius: 6px;
  color: rgba(212, 184, 134, 0.35);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  z-index: 2;
}
.cards-nav:hover {
  background: rgba(24, 24, 24, 0.45);
  color: rgba(212, 184, 134, 0.75);
  border-color: rgba(212, 184, 134, 0.18);
}
/* On touch devices, suppress sticky hover state */
@media (hover: none) {
  .cards-nav:hover {
    background: rgba(12, 12, 12, 0.22);
    color: rgba(212, 184, 134, 0.35);
    border-color: rgba(212, 184, 134, 0.07);
  }
}
.cards-nav--prev { left: 6px; }
.cards-nav--next { right: 6px; }

/* ── Keyframes ── */
@keyframes glow-breathe {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Smooth up-down float with acceleration feel */
@keyframes float-down {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(14px); }
}

@keyframes float-up {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

@media (prefers-reduced-motion: reduce) {
  .home-sections { transition: none; }
  .hero-glow,
  .hero-brand-logo,
  .hero-church-name,
  .hero-church-name__char,
  .ritual-btn,
  .hero-about-link,
  .scroll-indicator {
    animation: none;
    opacity: 1;
    transform: none;
    transition: none;
  }
  .scroll-indicator__arrow { animation: none; }
  .cards-back-top { opacity: 1; transform: none; transition: none; }
  .cards-back-top__arrow { animation: none; }
  .cards-tab,
  .cards-stage { opacity: 1; transform: none; transition: none; }
}

/* ════════════════════════════════════════
   DESKTOP — natural flowing layout
   ════════════════════════════════════════ */
@media (min-width: 1024px) {
  .home-snap {
    position: relative;
    overflow: visible;
  }

  .home-sections {
    transform: none !important;
    transition: none;
  }

  .home-section {
    height: auto;
    min-height: auto;
  }

  .home-section--hero.is-desktop {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home-section--cards {
    overflow-y: visible;
    min-height: auto;
  }

  .hero-center {
    transform: none;
    min-height: auto;
    padding: calc(72px + 2rem) 2rem 4rem;
  }

  .hero-center.is-fading {
    opacity: 1;
    filter: none;
    transform: none;
  }

  .cards-inner {
    max-width: 720px;
    padding: 2rem 2rem 4rem;
  }

  .hero-glow {
    width: min(60vw, 800px);
    height: min(60vw, 800px);
  }

  .hero-brand-logo {
    width: clamp(150px, 12vw, 180px);
    height: clamp(150px, 12vw, 180px);
  }

  .hero-church-name {
    font-size: clamp(3rem, 6vw, 5rem);
  }
}


/* ── Share FAB ── */
.share-fab {
  position: fixed;
  top: calc(60px + 1rem);
  right: 0.9rem;
  z-index: 50;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--dt-text-title);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  opacity: 0.72;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.share-fab:hover {
  opacity: 1;
}

.share-fab:active {
  transform: scale(0.9);
}

.share-fab:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.share-fab:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 3px;
  border-radius: 4px;
}

.share-icon {
  display: inline-block;
  width: 3em;
  height: 3em;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='m21 12l-7-7v4C7 10 4 15 3 20c2.5-3.5 6-5.1 11-5.1V19z'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}


</style>
