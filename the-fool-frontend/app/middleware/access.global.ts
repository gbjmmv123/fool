export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.requiresExamResult) {
    const resultId = to.query.resultId
    if (typeof resultId !== 'string' || !resultId) {
      return navigateTo('/')
    }
  }

  if (to.meta.requiresStaff && import.meta.client) {
    const { unlocked } = useStaffAuth()
    if (!unlocked.value) {
      return navigateTo('/')
    }
  }
})
