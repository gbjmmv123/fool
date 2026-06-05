<script setup lang="ts">
import { PAGE_META } from '~/data/copy'
definePageMeta({
  title: PAGE_META.exam,
  showTopNav: true,
})
</script>

<template>
  <MainContent :title="PAGE_META.exam">
    <ExamQuestionList />
  </MainContent>
</template>
