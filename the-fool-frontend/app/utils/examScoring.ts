import { EXAM_QUESTIONS } from '~/data/questions'
import type { ExamQuestion } from '~/data/questions'
import type { DepartmentId } from '~/types/department'

export interface ExamResult {
  assignedDepartmentId: DepartmentId
  storyId: 1 | 2 | 3
  amonTriggered: boolean
}

const DEPARTMENT_IDS: DepartmentId[] = [
  'justice', 'sun', 'hangedman', 'hermit',
  'magician', 'moon', 'star', 'judgement',
]

const AMON_STORY_MAP: Record<string, 1 | 2 | 3> = { a: 1, b: 2, c: 3 }

function findAmonQuestion(questions: ExamQuestion[]): ExamQuestion | undefined {
  return questions.find(q => q.specialType === 'amon-final')
}

export function calculateExamResult(
  answers: Record<string, string>,
  questions: ExamQuestion[] = EXAM_QUESTIONS,
): ExamResult {
  const scores: Record<DepartmentId, number> = Object.fromEntries(
    DEPARTMENT_IDS.map(id => [id, 0])
  ) as Record<DepartmentId, number>

  for (const question of questions) {
    if (question.specialType === 'amon-final') continue
    const selectedOptionId = answers[question.id]
    if (!selectedOptionId) continue
    const option = question.options.find(o => o.id === selectedOptionId)
    if (!option) continue

    for (const [deptId, weight] of Object.entries(option.weights)) {
      scores[deptId as DepartmentId] += weight ?? 0
    }
  }

  // Find max score and collect all tied departments
  let maxScore = -1
  const tiedDepartments: DepartmentId[] = []

  for (const deptId of DEPARTMENT_IDS) {
    if (scores[deptId] > maxScore) {
      maxScore = scores[deptId]
      tiedDepartments.length = 0
      tiedDepartments.push(deptId)
    } else if (scores[deptId] === maxScore) {
      tiedDepartments.push(deptId)
    }
  }

  // Randomly pick one if there's a tie
  const assignedDepartmentId: DepartmentId =
    tiedDepartments[Math.floor(Math.random() * tiedDepartments.length)]

  // Find Amon question dynamically (supports any id)
  const amonQuestion = findAmonQuestion(questions)
  const amonAnswer = amonQuestion ? answers[amonQuestion.id] : undefined
  const storyId: 1 | 2 | 3 = AMON_STORY_MAP[amonAnswer ?? ''] ?? 1
  const amonTriggered = amonAnswer === 'a' || amonAnswer === 'c'

  return { assignedDepartmentId, storyId, amonTriggered }
}
