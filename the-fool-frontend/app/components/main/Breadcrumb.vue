<script setup lang="ts">
interface Props {
  label: string
  description?: string
}
defineProps<Props>()
</script>

<template>
  <div>
    <nav class="breadcrumb" aria-label="面包屑导航">
      <NuxtLink to="/" class="breadcrumb__home">首页</NuxtLink>
      <span class="breadcrumb__sep" aria-hidden="true">/</span>
      <span class="breadcrumb__current" aria-current="page">{{ label }}</span>
    </nav>
    <p v-if="description" class="page-description">{{ description }}</p>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb__home {
  font-size: 0.875rem;
  color: var(--dt-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.breadcrumb__home:hover {
  color: var(--dt-text-title);
}

.breadcrumb__sep {
  font-size: 0.875rem;
  color: var(--dt-text-muted);
  opacity: 0.5;
  user-select: none;
}

.breadcrumb__current {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--dt-text-title);
}
</style>
