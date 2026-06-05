<script setup lang="ts">
const { state } = useAmonMode()
const reduced = useReducedMotion()
</script>

<template>

</template>

<style scoped>

@keyframes amonFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@media (prefers-reduced-motion: reduce) {
  .amon-watermark {
    animation: none;
  }
}
</style>
