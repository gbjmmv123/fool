import type { AmonModeState } from '~/types/user'

export function useAmonMode() {
  const { state } = useBootstrap()
  const route = useRoute()

  const enabled = computed(() => !!state.value?.joinedAmonFamily)

  // Show Amon nav after exam completion, regardless of membership
  const showAmonNav = computed(() => !!state.value?.hasCompletedExam)

  const modeState = computed<AmonModeState>(() => {
    const isAmonRoute = route.path === '/amon' || route.path.startsWith('/amon/')
    return {
      enabled: enabled.value,
      showAmonNav: showAmonNav.value,
      showAmonWatermark: enabled.value,
      showAmonTailContent: enabled.value,
      amonThemeClass: isAmonRoute && enabled.value ? 'theme-amon' : null,
    }
  })

  return { state: modeState, enabled, showAmonNav }
}
