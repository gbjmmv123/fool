<script setup lang="ts">
import { EXAM } from '~/data/copy'
defineEmits<{ start: [] }>()
</script>

<template>
  <section class="placeholder-card exam-intro">
    <h2 class="exam-intro__title">{{ EXAM.introTitle }}</h2>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p class="exam-intro__body" v-html="EXAM.introBody" />
    <button class="btn exam-intro__btn" @click="$emit('start')">{{ EXAM.startBtn }}</button>
  </section>
</template>

<style scoped>
.exam-intro {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  
  padding: 2.5rem 2rem;
}
.exam-intro__title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--dt-text-title);
  margin: 0;
}
.exam-intro__body {
  color: var(--dt-text-muted);
  line-height: 2;
  margin: 0;
}
.exam-intro__btn {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 7rem);
  aspect-ratio: 20 / 7;
  padding: 0 0.833rem;
  border: 1px solid var(--dt-border-default);
  border-radius: 8px;
  background: rgba(212, 184, 134, 0.08);
  font-size: 1.15rem;
  color: var(--dt-text-title);
}
</style>
