import { EXAM_QUESTIONS, EXAM_VERSION } from '~/data/questions'
import { calculateExamResult } from '~/utils/examScoring'
import { submitExam } from '~/services/exam'
import { scrollToFirstInvalidQuestion, scrollToQuestion } from '~/utils/scroll'
import { EXAM } from '~/data/copy'

export function useExamFlow() {
  const phase = useState<'intro' | 'answering' | 'submitting'>('church-exam-phase', () => 'intro')
  const answers = useState<Record<string, string>>('church-exam-answers', () => ({}))
  const submitError = ref<string | null>(null)
  const highlightId = ref<string | null>(null)

  const questions = EXAM_QUESTIONS
  const normalQuestions = computed(() => questions.filter(q => !q.specialType))
  const amonQuestion = computed(() => questions.find(q => q.specialType === 'amon-final') ?? null)

  const { debouncedSave, clear, reconcile } = useExamDraft()
  const { userId, initFromStorage } = useUserIdentity()
  const { refresh } = useBootstrap()
  const { openAlertDialog } = useDialog()

  const totalCount = computed(() => normalQuestions.value.length)
  const answeredCount = computed(() =>
    normalQuestions.value.filter(q => answers.value[q.id]).length
  )
  const allNormalAnswered = computed(() => answeredCount.value === totalCount.value)
  const showAmonQuestion = computed(() => allNormalAnswered.value)
  const allAnswered = computed(() =>
    allNormalAnswered.value && (amonQuestion.value ? !!answers.value[amonQuestion.value.id] : true)
  )

  function init() {
    if (phase.value === 'submitting') phase.value = 'answering'
    submitError.value = null
    const restored = reconcile()
    answers.value = restored
  }

  function start() {
    phase.value = 'answering'
  }

  function getNextUnansweredId(currentId: string): string | null {
    const idx = questions.findIndex(q => q.id === currentId)
    if (idx === -1) return null
    for (let i = idx + 1; i < questions.length; i++) {
      if (!answers.value[questions[i].id]) return questions[i].id
    }
    return null
  }

  async function setAnswer(questionId: string, optionId: string) {
    answers.value = { ...answers.value, [questionId]: optionId }
    if (highlightId.value === questionId) highlightId.value = null
    debouncedSave({
      version: EXAM_VERSION,
      answers: answers.value,
      updatedAt: Date.now(),
    })

    const nextId = getNextUnansweredId(questionId)
    if (nextId) {
      await nextTick()
      scrollToQuestion(nextId)
    }
  }

  function findFirstUnanswered(): string | null {
    for (const q of questions) {
      if (!answers.value[q.id]) return q.id
    }
    return null
  }

  async function submit() {
    if (phase.value === 'submitting') return
    if (!allAnswered.value) {
      const firstUnanswered = findFirstUnanswered()
      await openAlertDialog({ title: EXAM.alertTitle, message: EXAM.alertMessage })
      if (firstUnanswered) {
        scrollToFirstInvalidQuestion(firstUnanswered)
        highlightId.value = firstUnanswered
        setTimeout(() => {
          if (highlightId.value === firstUnanswered) highlightId.value = null
        }, 1500)
      }
      return
    }

    const id = userId.value ?? initFromStorage()
    if (!id) {
      submitError.value = EXAM.identityLost
      phase.value = 'answering'
      return
    }

    phase.value = 'submitting'
    submitError.value = null

    try {
      const { assignedDepartmentId, storyId, amonTriggered } = calculateExamResult(answers.value)

      const result = await submitExam({
        userId: id,
        assignedDepartmentId,
        storyId,
        amonTriggered,
        overwrite: true,
      })

      clear()
      await refresh(true)
      await navigateTo(`/exam/result?resultId=${encodeURIComponent(result.resultId)}&fresh=1`)
    } catch (e) {
      submitError.value = e instanceof Error ? e.message : '提交失败，请重试'
      phase.value = 'answering'
    }
  }

  return {
    phase,
    questions,
    normalQuestions,
    amonQuestion,
    answers,
    submitError,
    highlightId,
    totalCount,
    answeredCount,
    allAnswered,
    showAmonQuestion,
    init,
    start,
    setAnswer,
    submit,
  }
}
