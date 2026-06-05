<script setup lang="ts">
import { PAGE_META } from '~/data/copy'
import BadgeCard from '~/components/badge/BadgeCard.vue'
import BadgeForm from '~/components/badge/BadgeForm.vue'

definePageMeta({
  title: PAGE_META.badge,
  showTopNav: true,
})

const {
  config,
  avatarUrl,
  exporting,
  reset,
  pickAndCropAvatar,
  applyAvatarUrl,
  exportBadge,
} = useBadgeConfig()

const fileInputRef = ref<HTMLInputElement | null>(null)

function onSave() {
  exportBadge()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await pickAndCropAvatar(file)
  input.value = ''
}

function openPicker() {
  fileInputRef.value?.click()
}

const BADGE_NATURAL_WIDTH = 276
const BADGE_NATURAL_HEIGHT = Math.round(276 / 0.58)
const previewStageRef = ref<HTMLElement | null>(null)
const previewScale = ref(1)

function recomputeScale() {
  const el = previewStageRef.value
  if (!el) return
  const w = el.clientWidth
  if (w > 0) previewScale.value = Math.min(1, w / BADGE_NATURAL_WIDTH)
}

onMounted(() => {
  recomputeScale()
  window.addEventListener('resize', recomputeScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', recomputeScale)
})
</script>

<template>
  <MainContent :title="PAGE_META.badge">
    <div class="badge-page">
      <section class="badge-preview-sticky">
        <div ref="previewStageRef" class="badge-preview-stage">
          <div
            class="badge-preview-scaler"
            :style="{
              width: `${BADGE_NATURAL_WIDTH * previewScale}px`,
              height: `${BADGE_NATURAL_HEIGHT * previewScale}px`,
            }"
          >
            <div
              class="badge-preview-scaler__inner"
              :style="{ transform: `scale(${previewScale})` }"
            >
              <BadgeCard :config="config" :avatar-url="avatarUrl" />
            </div>
          </div>
        </div>
      </section>

      <section class="badge-form-area">
        <BadgeForm
          :config="config"
          :exporting="exporting"
          @pick-avatar="openPicker"
          @use-preset-avatar="applyAvatarUrl"
          @reset="reset"
          @save="onSave"
        />
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="badge-file-input"
          @change="onFileChange"
        >
      </section>
    </div>
  </MainContent>
</template>

<style scoped>
.badge-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.badge-preview-sticky {
  position: relative;
  top: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 0.75rem 0 0.5rem;
  background: linear-gradient(
    180deg,
    var(--dt-bg-base) 0%,
    var(--dt-bg-base) 75%,
    rgba(18, 18, 18, 0) 100%
  );
}

.badge-preview-stage {
  width: min(60vw, 240px);
  display: grid;
  place-items: center;
}

.badge-preview-scaler {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}

.badge-preview-scaler__inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 276px;
  transform-origin: top left;
}

.badge-form-area {
  padding-bottom: 2rem;
}

.badge-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

@media (min-width: 768px) {
  .badge-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
  }

  .badge-preview-sticky {
    position: sticky;
    top: calc(72px + 1rem);
    padding: 0;
    background: none;
  }

  .badge-preview-stage {
    width: 320px;
  }
}
</style>
