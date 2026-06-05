import { HOME, t } from '~/data/copy'

export interface HomeWelcomeIntent {
  type: 'name' | 'urge_exam' | 'welcome_back' | 'none'
  message: string
  dedupeKey: string | null
}

export interface HomeViewModel {
  showOverview: boolean
  showExamEntry: boolean
  showChurchIntro: boolean
  showArcanaIntro: boolean
  examEntryMode: 'start' | 'review'
  welcomeIntent: HomeWelcomeIntent
}

const TODAY = () => new Date().toISOString().slice(0, 10)



export function useHomeView() {
  const { state } = useBootstrap()

  const view = computed<HomeViewModel>(() => {
    const s = state.value
    const examEntryMode = s.hasCompletedExam ? 'review' : 'start'
    const nickname = s.nickname ?? HOME.defaultNickname

    let welcomeIntent: HomeWelcomeIntent = { type: 'none', message: '', dedupeKey: null }
    switch (s.homepageMessageType) {
      case 'name':
        welcomeIntent = { type: 'name', message: '', dedupeKey: null }
        break
      case 'urge_exam':
        welcomeIntent = {
          type: 'urge_exam',
          message: `${nickname}，请尽快完成入会笔试，部门正在等待你。`,
          dedupeKey: `${s.userId}:urge_exam:${TODAY()}`,
        }
        break
      case 'welcome_back':
        welcomeIntent = {
          type: 'welcome_back',
          message: `欢迎回来，${nickname}。`,
          dedupeKey: `${s.userId}:welcome_back:${TODAY()}`,
        }
        break
    }

    return {
      showOverview: true,
      showExamEntry: true,
      showChurchIntro: true,
      showArcanaIntro: true,
      examEntryMode,
      welcomeIntent,
    }
  })

  return { view }
}
