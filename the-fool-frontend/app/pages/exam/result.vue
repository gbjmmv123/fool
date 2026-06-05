<script setup lang="ts">
import { PAGE_META, RESULT, COMMON } from '~/data/copy'
import { t } from '~/data/copy'
definePageMeta({
  title: PAGE_META.examResult,
  showTopNav: true,
  requiresExamResult: true,
})

const story = useExamResultStory()
const { state } = useBootstrap()


const { openShareCardDialog } = useDialog()

function handleShare() {
  const resultData = story.data.value
  if (!resultData) return
  openShareCardDialog(resultData)
}

onMounted(() => { story.init() })
</script>

<template>
  <!-- Share button: floating top-right -->
  <button
    v-if="story.data.value"
    class="share-fab"
    aria-label="分享结果"
    @click="handleShare"
  >
    <span class="share-icon" />
  </button>
  <MainContent
    :title="PAGE_META.examResult"
    :description="state.nickname ? t(RESULT.resultDescTemplate, { nickname: state.nickname ?? '', deptName: story.data.value?.assignedDepartmentName ?? '' }) : undefined"
  >
    <ResultLoadingPanel v-if="story.stage.value === 'loading'" />

    <div v-else-if="story.stage.value === 'error'" class="result-error">
      <p class="result-error__msg">{{ story.error.value }}</p>
      <div class="result-error__actions">
        <button class="btn" @click="story.retry()">{{ COMMON.retry }}</button>
        <NuxtLink to="/" class="btn">{{ COMMON.backToHome }}</NuxtLink>
      </div>
    </div>

    <ResultAmonCinematic
      v-else-if="story.stage.value === 'cinematic' && story.data.value"
      :story-id="story.data.value.storyId"
      @done="story.cinematicDone()"
    />

    <template v-else-if="story.stage.value === 'detail' && story.data.value">
      <div class="result-detail-stack">
        <ResultDetailCard
          :department-id="story.data.value.assignedDepartmentId"
          :joined-at="story.data.value.detail.joinedAt"
        />
        <ResultShareCard :data="story.data.value" />
      </div>
    </template>
  </MainContent>
</template>

<style scoped>
.result-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
}
.result-error__msg {
  color: var(--dt-state-danger);
  margin: 0;
}
.result-error__actions {
  display: flex;
  gap: 0.75rem;
}

.result-detail-stack {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.share-fab {
  position: fixed;
  top: calc(60px + 1rem);
  right: 0.9rem;
  z-index: 50;
  border: none;
    width: 35px;
  height: 35px;
  background: none;
  color: var(--dt-text-title);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 28px;
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

.share-fab:focus-visible {
  outline: 2px solid var(--dt-border-active);
  outline-offset: 3px;
  border-radius: 4px;
}

.share-icon {
  display: inline-block;
  width: 2em;
  height: 2em;
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
