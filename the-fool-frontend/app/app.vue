<script setup lang="ts">
const { initFromStorage, isLoggedIn, generateUserId, setLoggedInUser } = useUserIdentity()
const { refresh } = useBootstrap()

onMounted(async () => {
  initFromStorage()

  if (!isLoggedIn.value) {
    setLoggedInUser(generateUserId())
  }

  await refresh().catch(() => {
    // 错误写入 error.value，由页面自己消费
  })
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
