<script setup lang="ts">
import { getDepartmentData } from '~/data/departments'
import { formatDateTime } from '~/utils/time'
import { RESULT, t } from '~/data/copy'

const props = defineProps<{
  departmentId: string
  joinedAt?: string
  showRetake?: boolean
  hideFooter?: boolean
}>()
const emit = defineEmits<{ retake: [] }>()

const reduced = useReducedMotion()
const visible = ref(false)

onMounted(() => {
  if (reduced.value) {
    visible.value = true
  } else {
    requestAnimationFrame(() => {
      setTimeout(() => { visible.value = true }, 80)
    })
  }
})

const dept = computed(() => getDepartmentData(props.departmentId))
const joinedAtFormatted = computed(() => props.joinedAt ? formatDateTime(props.joinedAt) : null)
const deptTitle = computed(() => {
  if (!dept.value) return ''
  return dept.value.name + (dept.value.officer.gender === 'female' ? t('女士', {}) : t('先生', {}))
})

const funFactRef = ref<HTMLElement | null>(null)
const funFactSplit = ref<[string, string] | null>(null)

function checkFunFactWrap() {
  const el = funFactRef.value
  if (!el || !dept.value) return
  const lh = parseFloat(getComputedStyle(el).lineHeight)
  if (!isNaN(lh) && el.scrollHeight > lh * 1.5) {
    const text = dept.value.funFact
    const idx = text.search(/[，,]/)
    if (idx > -1) {
      funFactSplit.value = [text.slice(0, idx + 1), text.slice(idx + 1).trimStart()]
    }
  }
}

onMounted(() => nextTick(checkFunFactWrap))
</script>

<template>
  <div
    v-if="dept"
    class="result-card"
    :class="{ 'is-visible': visible, 'is-reduced': reduced }"
    :style="{ '--card-theme': dept.themeColor }"
  >
    <div class="result-card__accent-bar" />

    <div class="result-card__body">
      <div class="result-card__avatar-section">
        <div class="result-card__avatar-wrap">
          <div class="result-card__avatar-glow" />
          <img
            :src="dept.officer.avatar"
            :alt="dept.officer.name"
            class="result-card__avatar"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>
        <p class="result-card__dept-title">{{ deptTitle }}</p>
      </div>

      <div class="result-card__dept-section">
        <p class="result-card__description">{{ dept.description }}</p>
        <p ref="funFactRef" class="result-card__fun-fact">
          <template v-if="funFactSplit">{{ funFactSplit[0] }}<br>{{ funFactSplit[1] }}</template>
          <template v-else>{{ dept.funFact }}</template>
        </p>
      </div>

      <div class="result-card__divider" v-if="!hideFooter" />

      <div class="result-card__footer" v-if="!hideFooter">
        <button
          v-if="showRetake"
          class="result-card__retake"
          @click="emit('retake')"
        >{{ RESULT.retakeExam }}</button>
        <span v-else />
        <p v-if="joinedAtFormatted" class="result-card__joined">{{ t(RESULT.joinedAtLabel, { date: joinedAtFormatted ?? '' }) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.45s ease, transform 0.45s ease;
  background: var(--dt-bg-elevated);
  border-radius: var(--dt-radius-card);
  border: 1px solid color-mix(in srgb, var(--card-theme) 28%, transparent);
  box-shadow:
    var(--dt-shadow-card),
    0 0 60px color-mix(in srgb, var(--card-theme) 18%, transparent),
    inset 0 0 40px color-mix(in srgb, var(--card-theme) 4%, transparent);
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.result-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.result-card.is-reduced {
  opacity: 1;
  transform: none;
  transition: none;
}

.result-card__accent-bar {
  height: 4px;
  background: var(--card-theme);
}

.result-card__body {
  height: 464px;
  overflow: hidden;
  padding: 1.5rem 1.75rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Avatar section */
.result-card__avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.result-card__avatar-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 240px;
  height: 240px;
}

.result-card__avatar-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 65%,
    color-mix(in srgb, var(--card-theme) 22%, transparent) 0%,
    color-mix(in srgb, var(--card-theme) 8%, transparent) 50%,
    transparent 75%
  );
  filter: blur(16px);
}

.result-card__avatar {
  position: relative;
  z-index: 1;
  width: 230px;
  height: 230px;
  object-fit: contain;
  object-position: bottom;
  display: block;
}

.result-card__dept-title {
  font-size: 1.2rem;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.06em;
}

/* Dividers */
.result-card__divider {
  height: 1px;
  background: var(--dt-border-subtle);
}

/* Department section */
.result-card__dept-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}

.result-card__description {
  height: 74px;
  overflow: hidden;
  font-size: 0.83rem;
  color: color-mix(in srgb, var(--card-theme) 70%, var(--dt-text-muted) 30%);
  line-height: 1.85;
  margin: 0;
}

.result-card__fun-fact {
  font-size: 0.7rem;
  color: var(--dt-text-muted); 
  line-height: 1.6;
  margin: 0;
  text-align: right;
  font-style: italic;
  opacity: 0.85;
}

/* Footer */
.result-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-card__joined {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.02em;
  margin: 0;
}

/* Retake button */
.result-card__retake {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  background: none;
  border: none;
  border-bottom: 1px solid currentColor;
  padding: 0;
  cursor: pointer;
  letter-spacing: 0.02em;
  opacity: 0.7;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.result-card__retake:hover {
  opacity: 1;
  color: var(--dt-text-base);
}

.result-card__retake:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 3px;
  border-radius: 2px;
}
</style>
