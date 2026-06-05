<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <section class="placeholder-card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <slot />
  </section>
</template>
