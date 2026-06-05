<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div>
    <h1 class="page-title">{{ title }}</h1>
    <p v-if="description" class="page-description">{{ description }}</p>
  </div>
</template>
