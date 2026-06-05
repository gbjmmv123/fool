<script setup lang="ts">
interface Props {
  title: string
  description?: string
  wide?: boolean
  noTitle?: boolean
}

const props = defineProps<Props>()
const route = useRoute()

const isWide = computed(() => props.wide ?? !!route.meta.wideLayout)
const isHomePage = computed(() => route.path === '/')
</script>

<template>
  <section class="main-content" :class="{ 'main-content--wide': isWide }">
    <header v-if="!noTitle && !isHomePage" class="main-content__header">
      <Breadcrumb :label="title" :description="description" />
      <slot name="actions" />
    </header>
    <div class="main-content__body">
      <slot />
    </div>
  </section>
</template>
