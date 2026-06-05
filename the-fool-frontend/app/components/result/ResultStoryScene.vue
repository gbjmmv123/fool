<script setup lang="ts">
import type { StoryId } from '~/types/result'
import type { StorySubStage } from '~/composables/useExamResultStory'

const props = defineProps<{
  storyId: StoryId
  subStage: StorySubStage
}>()

const storyTexts: Record<StoryId, string> = {
  1: '好呀好呀，又一个有趣的灵魂。',
  2: 'Leodero 已记下你的名字。',
  3: '你想跑？阿蒙在你身后笑着。',
}

const text = computed(() => storyTexts[props.storyId])

const textVisible = computed(() =>
  props.subStage === 'text-in' || props.subStage === 'text-hold'
)
const amonVisible = computed(() =>
  props.subStage === 'amon-in' || props.subStage === 'amon-out'
)
</script>

<template>
  <section class="story-scene" aria-live="polite">
    <Transition name="story-text">
      <p v-if="textVisible" class="story-scene__text">{{ text }}</p>
    </Transition>
    <Transition name="story-amon">
      <div v-if="amonVisible" class="story-scene__amon" aria-hidden="true">阿蒙</div>
    </Transition>
  </section>
</template>

<style scoped>
.story-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 2rem;
  padding: 3rem 2rem;
}
.story-scene__text {
  font-size: clamp(1.1rem, 2vw + 0.8rem, 1.5rem);
  color: var(--dt-text-title);
  text-align: center;
  line-height: 1.6;
  margin: 0;
}
.story-scene__amon {
  font-size: clamp(3rem, 10vw, 6rem);
  color: var(--dt-text-muted);
  opacity: 0.6;
}
.story-text-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.story-text-leave-active {
  transition: opacity 0.5s ease;
}
.story-text-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.story-text-leave-to {
  opacity: 0;
}
.story-amon-enter-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.story-amon-leave-active {
  transition: opacity 0.6s ease;
}
.story-amon-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.story-amon-leave-to {
  opacity: 0;
}
</style>
