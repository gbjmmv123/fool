<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const lines = [
  '我主自称愚者，在过去，在现在，也在未来，他是支配灵界的伟大主宰，也是执掌好运的黄黑之王，更是每个生灵追求永恒的道标。',
  '我主居于现实和灵界之上，仁慈洒满了天国和大地，祂的座旁共有六位天使侍立。',
  '水银天使是命运的化身，是我主最宠爱的天使。',
  '死亡天使是跟随我主最久的存在，是冥界的执政官。',
  '救赎天使是我主的号角，是祂神谕的传达者。',
  '生命天使是智慧的结晶，是每个人体内永不磨灭的灵性。',
  '主的神座旁边还有惩戒天使，祂是主的雷霆，主的怒火，主的手掌，是所有堕落者和不洁者的审判官及处刑人。',
  '和惩戒天使相对的是时之天使，祂是古老年代里的王，最终臣服于我主，为祂敲击天国之钟',
]

const containerRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const reduced = useReducedMotion()

useIntersectionObserver(containerRef, ([entry]) => {
  if (entry.isIntersecting) visible.value = true
}, { threshold: 0.1 })

onMounted(() => { if (reduced.value) visible.value = true })
</script>

<template>
  <section
    ref="containerRef"
    class="about-reveal"
    :class="{ 'is-visible': visible, 'is-reduced': reduced }"
  >
    <p
      v-for="(line, i) in lines"
      :key="i"
      class="about-reveal__line"
      :style="{ '--i': i }"
    >
      {{ line }}
    </p>
  </section>
</template>

<style scoped>
.about-reveal {
  display: grid;
  gap: 0.9rem;
  font-size: clamp(1rem, 1.4vw + 0.8rem, 1.25rem);
  line-height: 1.85;
  color: var(--dt-text-body);
}
.about-reveal__line {
  margin: 0;
  opacity: 0;
  transform: translateY(16px);
  filter: blur(6px);
  transition: opacity 0.9s ease, transform 0.9s ease, filter 0.9s ease;
  transition-delay: calc(var(--i, 0) * 420ms);
}
.about-reveal.is-visible .about-reveal__line {
  opacity: 1;
  transform: none;
  filter: blur(0);
}
.about-reveal.is-reduced .about-reveal__line {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
  .about-reveal__line {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
</style>
