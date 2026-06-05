<script setup lang="ts">
import { RESULT } from '~/data/copy'
import type { StoryId } from '~/types/result'

const props = defineProps<{ storyId: StoryId }>()
const emit = defineEmits<{ done: [] }>()

// a(好呀好呀)→1  b(列奥德罗)→2  c(纸人替身)→3
const STORY_LINES: Record<StoryId, string[]> = {
  1: [
    '你抬起手，',
    '从虚空中掏出一片单片眼镜戴在了右眼上。',
  ],
  2: [
    '想象中的雷暴并未出现，',
    '只有一道温暖的圣光笼罩了你。',
    '思维的滞涩感完全消失，',
    '就好像什么都没有发生过。',
  ],
  3: [
    '这下总该跑掉了吧？',
    '你心惊胆颤地想着。',
    '就在这时，你发现自己不受控制地抬起手，',
    '从虚空中掏出一片单片眼镜戴在了右眼上。',
  ],
}

const lines = computed(() => STORY_LINES[props.storyId])

type Phase = 'entering' | 'lines' | 'hold' | 'text-out' | 'amon' | 'amon-out' | 'exiting'
const phase = ref<Phase>('entering')
const isActive = ref(false)
const isExiting = ref(false)
const visibleLines = ref(0)

const showText = computed(() => ['lines', 'hold'].includes(phase.value))
const showAmon = computed(() => phase.value === 'amon')

let cancelled = false
function wait(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

onMounted(async () => {
  await wait(50)
  isActive.value = true
  await wait(600)

  phase.value = 'lines'
  for (let i = 1; i <= lines.value.length; i++) {
    if (cancelled) return
    visibleLines.value = i
    await wait(1100)
  }

  if (cancelled) return
  phase.value = 'hold'
  await wait(1500)

  if (cancelled) return
  phase.value = 'text-out'
  await wait(800)

  if (cancelled) return
  phase.value = 'amon'
  await wait(2700)  

  if (cancelled) return
  phase.value = 'amon-out'
  await wait(1000)

  if (cancelled) return
  isExiting.value = true
  await wait(900)

  if (cancelled) return
  emit('done')
})

onUnmounted(() => { cancelled = true })
</script>

<template>
  <Teleport to="body">
    <div
      class="cinematic"
      :class="{ 'cinematic--active': isActive, 'cinematic--exiting': isExiting }"
      aria-live="polite"
    >
      <div class="cinematic__content">
        <Transition name="cine-text">
          <div v-if="showText" class="cinematic__lines">
            <p
              v-for="(line, idx) in lines"
              :key="idx"
              class="cinematic__line"
              :class="{ 'cinematic__line--visible': idx < visibleLines }"
            >{{ line }}</p>
          </div>
        </Transition>

        <Transition name="cine-amon">
          <div v-if="showAmon" class="cinematic__amon" aria-hidden="true">
            <div class="cinematic__amon-glow" />
            <img src="/static/avatars/amon.png" alt="" class="cinematic__amon-img" />
            <p class="cinematic__amon-caption">{{ RESULT.amonCaption }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cinematic {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: radial-gradient(ellipse at center, #1c1610 0%, #080808 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.cinematic--active {
  opacity: 1;
  pointer-events: all;
}

.cinematic--exiting {
  opacity: 0 !important;
  transition: opacity 0.9s ease !important;
  pointer-events: none;
}

.cinematic__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  max-width: 680px;
  width: 100%;
  min-height: 200px;
  overflow: visible;
}

.cinematic__lines {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.cinematic__line {
  font-size: clamp(1.1rem, 2vw + 0.7rem, 1.5rem);
  color: var(--dt-text-title);
  text-align: center;
  line-height: 1.9;
  letter-spacing: 0.06em;
  margin: 0;
  text-shadow:
    0 0 40px rgba(212, 184, 134, 0.4),
    0 2px 12px rgba(0, 0, 0, 0.9);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.cinematic__line--visible {
  opacity: 1;
  transform: translateY(0);
}

.cinematic__amon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.25rem 0 2.75rem;
  overflow: visible;
  isolation: isolate;
}

.cinematic__amon-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(82vw, 430px);
  height: min(96vw, 520px);
  border-radius: 50%;
  transform: translate(-50%, -52%);
  background: radial-gradient(
    ellipse at 50% 60%,
    rgba(212, 184, 134, 0.24) 0%,
    rgba(212, 184, 134, 0.14) 30%,
    rgba(212, 184, 134, 0.06) 56%,
    rgba(212, 184, 134, 0.02) 72%,
    transparent 84%
  );
  filter: blur(34px);
  pointer-events: none;
}

.cinematic__amon-img {
  position: relative;
  z-index: 1;
  width: 280px;
  height: 280px;
  object-fit: contain;
  object-position: bottom;
  opacity: 0.72;
  filter: drop-shadow(0 0 32px rgba(212, 184, 134, 0.28));
}

.cinematic__amon-caption {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.125rem;
  letter-spacing: 0.18em;
  color: var(--dt-text-title);
  text-shadow:
    0 0 24px rgba(212, 184, 134, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.8);
}

/* 整块文字区域的进出 */
.cine-text-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.cine-text-leave-active {
  transition: opacity 0.8s ease;
}
.cine-text-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.cine-text-leave-to {
  opacity: 0;
}

/* 阿蒙图片进出 */
.cine-amon-enter-active {
  transition: opacity 1.2s ease, transform 1.2s ease;
}
.cine-amon-leave-active {
  transition: opacity 1s ease, transform 1s ease;
}
.cine-amon-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(20px);
}
.cine-amon-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-10px);
}
</style>
