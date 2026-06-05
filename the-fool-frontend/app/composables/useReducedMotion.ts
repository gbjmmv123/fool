import { useMediaQuery } from '@vueuse/core'

export function useReducedMotion() {
  const mq = useMediaQuery('(prefers-reduced-motion: reduce)')
  const optIn = useState<boolean>('church-reduced-motion-opt-in', () => false)

  onMounted(() => {
    const stored = localStorage.getItem('church_reduced_motion_opt_in')
    if (stored === '1') optIn.value = true
  })

  return computed(() => mq.value || optIn.value)
}
