<script setup lang="ts">
const visible = ref(false)
onMounted(() => { requestAnimationFrame(() => { visible.value = true }) })
</script>

<template>
  <section class="about-intro" :class="{ 'is-visible': visible }">
    <p>女士们先生们,能占用一下您的时间吗?我想向您讲一讲我们尊敬的“愚者”先生!</p>
  </section>
</template>

<style scoped>
.about-intro {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  font-size: clamp(1rem, 1.4vw + 0.8rem, 1.25rem);
  line-height: 1.85;
  color: var(--dt-text-heading);
  display: grid;
  gap: 0.9rem;
}
.about-intro p {
  margin: 0;
}
.about-intro.is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .about-intro {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
