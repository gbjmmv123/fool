<script setup lang="ts">
import TopNav from '~/components/nav/TopNav.vue'
</script>

<template>
  <div class="app-shell">
    <TopNav />
    <main class="app-main">
      <slot />
    </main>
    <ModalContainer />
    <MessageToast />
  </div>
</template>
