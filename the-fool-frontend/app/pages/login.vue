<script setup lang="ts">
import { PAGE_META } from '~/data/copy'
definePageMeta({ layout: 'none' })

const { generateUserId, setLoggedInUser, isLoggedIn } = useUserIdentity()
const { refresh } = useBootstrap()

onMounted(async () => {
  if (isLoggedIn.value) {
    await navigateTo('/')
    return
  }
  const userId = generateUserId()
  setLoggedInUser(userId)
  await refresh(true).catch(() => {})
  await navigateTo('/')
})
</script>

<template>
  <div class="login-init">
    <p>正在初始化……</p>
  </div>
</template>

<style scoped>
.login-init {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: var(--dt-text-secondary);
}
</style>
