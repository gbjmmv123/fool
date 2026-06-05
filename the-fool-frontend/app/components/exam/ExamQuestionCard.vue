<script setup lang="ts">
import type { ExamQuestion } from '~/data/questions'

const props = defineProps<{
  index: number
  question: ExamQuestion
  selected?: string
  highlighted: boolean
}>()

defineEmits<{ select: [optionId: string] }>()
</script>

<template>
  <section
    :id="question.id"
    class="placeholder-card exam-q"
    :class="{
      'exam-q--amon': question.specialType === 'amon-final',
      'is-highlighted': highlighted,
    }"
  >
    <p class="exam-q__index">第 {{ index }} 题</p>
    <h3 class="exam-q__title">{{ question.title }}</h3>
    <ul class="exam-q__options" role="radiogroup" :aria-label="question.title">
      <li
        v-for="option in question.options"
        :key="option.id"
        class="exam-q__option"
        :class="{ 'is-selected': selected === option.id }"
        role="radio"
        :aria-checked="selected === option.id"
        tabindex="0"
        @click="$emit('select', option.id)"
        @keydown.enter="$emit('select', option.id)"
        @keydown.space.prevent="$emit('select', option.id)"
      >
        <span class="exam-q__option-dot" />
        <span class="exam-q__option-label">{{ option.label }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.exam-q {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.exam-q__index {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  margin: 0;
}
.exam-q__title {
  font-size: 1rem;
  color: var(--dt-text-body);
  margin: 0;
  line-height: 1.6;
}
.exam-q__options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
.exam-q__option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}
.exam-q__option:hover {
  border-color: var(--dt-border-default);
  background: rgba(212, 184, 134, 0.05);
}
.exam-q__option:active {
  transform: scale(0.98);
}
.exam-q__option.is-selected {
  border-color: var(--dt-border-active);
  background: rgba(212, 184, 134, 0.1);
}
.exam-q__option-dot {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--dt-border-subtle);
  margin-top: 2px;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.exam-q__option.is-selected .exam-q__option-dot {
  border-color: var(--dt-border-active);
  background: var(--dt-border-active);
}
.exam-q__option-label {
  font-size: 0.95rem;
  color: var(--dt-text-body);
  line-height: 1.5;
}

/* amon-final 题特殊样式 */
.exam-q--amon {
  border: 1px solid rgba(120, 60, 100, 0.6);
  background: rgba(30, 10, 25, 0.35);
  box-shadow: 0 0 18px rgba(140, 50, 110, 0.18), inset 0 0 24px rgba(80, 20, 60, 0.12);
}
.exam-q--amon .exam-q__index {
  color: rgba(200, 140, 180, 0.7);
}
.exam-q--amon .exam-q__title {
  color: rgba(230, 190, 215, 0.95);
}
.exam-q--amon .exam-q__option {
  border-color: rgba(140, 60, 110, 0.4);
  background: rgba(60, 15, 45, 0.2);
}
.exam-q--amon .exam-q__option:hover {
  border-color: rgba(180, 80, 150, 0.65);
  background: rgba(100, 30, 75, 0.25);
}
.exam-q--amon .exam-q__option.is-selected {
  border-color: rgba(200, 100, 165, 0.85);
  background: rgba(120, 40, 90, 0.3);
}
.exam-q--amon .exam-q__option-dot {
  border-color: rgba(160, 80, 130, 0.5);
}
.exam-q--amon .exam-q__option.is-selected .exam-q__option-dot {
  border-color: rgba(210, 110, 175, 0.9);
  background: rgba(210, 110, 175, 0.9);
}
.exam-q--amon .exam-q__option-label {
  color: rgba(220, 180, 205, 0.9);
}

/* 高亮未答题 */
.is-highlighted {
  border-color: var(--dt-state-danger);
  animation: highlight-pulse 1.5s ease forwards;
}
@keyframes highlight-pulse {
  0%, 100% { border-color: var(--dt-state-danger); }
  50% { border-color: rgba(209, 107, 107, 0.3); }
}
@media (prefers-reduced-motion: reduce) {
  .is-highlighted {
    animation: none;
    border-color: var(--dt-state-danger);
  }
}
</style>
