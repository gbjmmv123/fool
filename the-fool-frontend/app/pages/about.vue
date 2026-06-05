<script setup lang="ts">
import { PAGE_META } from '~/data/copy'
definePageMeta({
  title: PAGE_META.about,
  showTopNav: true,
})
</script>

<template>
  <MainContent :title="PAGE_META.about" >
    <AboutIntroParagraph />
    <AboutLineReveal />
  </MainContent>
</template>
