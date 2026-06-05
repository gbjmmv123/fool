export function scrollToFirstInvalidQuestion(questionId: string) {
  if (!import.meta.client) {
    return
  }

  document.getElementById(questionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function scrollToQuestion(questionId: string) {
  if (!import.meta.client) return
  document.getElementById(questionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
