/**
 * 移动端键盘适配 —— 解决 iOS Safari 键盘收起后页面下方变黑的问题。
 *
 * 策略：
 * 1. position:fixed + inset:0 根布局（CSS 层）
 * 2. 键盘收起时通过 GPU 合成层重建触发完整重绘，不碰滚动位置
 * 3. 输入框 blur 事件兜底
 */
export function useMobileKeyboard() {
  if (!import.meta.client) return

  let rafId = 0
  let blurTimer: ReturnType<typeof setTimeout> | null = null
  const previousViewportHeight = ref(window.innerHeight)

  function getScrollContainer(): HTMLElement | null {
    return document.getElementById('__nuxt')
  }

  /**
   * 强制 GPU 合成层重建 → 触发完整重绘消除黑边
   * 不改变任何布局/滚动属性，不会产生视觉闪烁
   */
  function forceRepaint() {
    const container = getScrollContainer()
    if (!container) return

    // 创建临时 GPU 合成层，迫使 iOS Safari 重绘整个视口
    container.style.webkitTransform = 'translateZ(0)'
    void container.offsetHeight
    container.style.webkitTransform = ''
  }

  function onViewportChange() {
    if (!window.visualViewport) return
    const vh = window.visualViewport.height

    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      const prev = previousViewportHeight.value
      previousViewportHeight.value = vh

      if (prev > 0 && vh > prev && window.innerHeight - vh < 80) {
        forceRepaint()
      }
    })
  }

  function onInputBlur() {
    if (blurTimer) clearTimeout(blurTimer)
    blurTimer = setTimeout(() => {
      forceRepaint()
    }, 400)
  }

  function onInputFocus() {
    if (!window.visualViewport) return
    previousViewportHeight.value = window.visualViewport.height
  }

  function bindInputs(root: HTMLElement | Document = document) {
    const inputs = root.querySelectorAll('input, textarea, select')
    inputs.forEach((el) => {
      el.addEventListener('focus', onInputFocus, { passive: true })
      el.addEventListener('blur', onInputBlur, { passive: true })
    })
    return () => {
      inputs.forEach((el) => {
        el.removeEventListener('focus', onInputFocus)
        el.removeEventListener('blur', onInputBlur)
      })
    }
  }

  onMounted(() => {
    previousViewportHeight.value = window.innerHeight

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange)
      window.visualViewport.addEventListener('scroll', onViewportChange)
    }

    const cleanupInputs = bindInputs()

    onUnmounted(() => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportChange)
        window.visualViewport.removeEventListener('scroll', onViewportChange)
      }
      cancelAnimationFrame(rafId)
      if (blurTimer) clearTimeout(blurTimer)
      cleanupInputs()
    })
  })
}
