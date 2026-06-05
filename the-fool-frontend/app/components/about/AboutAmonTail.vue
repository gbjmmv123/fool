<script setup lang="ts">
const { state } = useBootstrap()
const show = computed(() => !!state.value?.joinedAmonFamily)
</script>

<template>
  <section v-if="show" class="about-tail">
    <h2 class="about-tail__title">……镜子之外</h2>
    <p class="about-tail__body">有人说，愚者背后还有一只手在轻轻推。那只手属于阿蒙。</p>
    <NuxtLink to="/amon" class="about-tail__link">前往阿蒙家族 →</NuxtLink>
  </section>
</template>

<style scoped>
.about-tail {
  margin-top: 2rem;
  padding: 1.25rem;
  border: 1px dashed var(--dt-border-default);
  border-radius: var(--dt-radius-card);
  background: rgba(212, 184, 134, 0.04);
  display: grid;
  gap: 0.75rem;
}
.about-tail__title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--dt-text-title);
}
.about-tail__body {
  margin: 0;
  color: var(--dt-text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
}
.about-tail__link {
  color: var(--dt-text-title);
  text-decoration: none;
  font-size: 0.9rem;
}
.about-tail__link:hover {
  text-decoration: underline;
}
</style>
