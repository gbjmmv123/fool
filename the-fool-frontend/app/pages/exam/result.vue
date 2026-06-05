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

onMounted(() => { story.init() })
</script>

<template>
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
</style>
