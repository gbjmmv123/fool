<script setup lang="ts">
const flow = useExamFlow()
onMounted(() => flow.init())
</script>

<template>
  <ExamIntroPanel v-if="flow.phase.value === 'intro'" @start="flow.start()" />
  <template v-else>
    <ExamProgress :answered="flow.answeredCount.value" :total="flow.totalCount.value" />
    <ExamQuestionCard
      v-for="(q, i) in flow.normalQuestions.value"
      :key="q.id"
      :index="i + 1"
      :question="q"
      :selected="flow.answers.value[q.id]"
      :highlighted="flow.highlightId.value === q.id"
      @select="(optionId) => flow.setAnswer(q.id, optionId)"
    />
    <Transition name="amon-q">
      <ExamQuestionCard
        v-if="flow.showAmonQuestion.value && flow.amonQuestion.value"
        :key="flow.amonQuestion.value.id"
        :index="flow.totalCount.value + 1"
        :question="flow.amonQuestion.value"
        :selected="flow.answers.value[flow.amonQuestion.value.id]"
        :highlighted="flow.highlightId.value === flow.amonQuestion.value.id"
        @select="(optionId) => flow.setAnswer(flow.amonQuestion.value!.id, optionId)"
      />
    </Transition>
    <ExamSubmitBar
      :submitting="flow.phase.value === 'submitting'"
      :error="flow.submitError.value"
      @submit="flow.submit()"
    />
  </template>
</template>

<style scoped>
.amon-q-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.amon-q-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
</style>
