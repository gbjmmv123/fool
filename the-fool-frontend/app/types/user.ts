export interface UserBootstrapState {
  userId: string
  nickname: string | null
  isNewUser: boolean
  hasCompletedExam: boolean
  hasDepartment: boolean
  departmentId: string | null
  departmentName: string | null
  joinedAmonFamily: boolean
  latestExamResultId: string | null
  homepageMessageType: 'name' | 'urge_exam' | 'welcome_back' | 'none'
}

export interface AmonModeState {
  enabled: boolean
  showAmonNav: boolean
  showAmonWatermark: boolean
  showAmonTailContent: boolean
  amonThemeClass: string | null
}
