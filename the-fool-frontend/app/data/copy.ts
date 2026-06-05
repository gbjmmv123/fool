/**
 * 愚者教会前端文案集中管理
 * 小黄同学可直接修改此文件中的文案，替换后重新部署即可生效。
 */

// ============================================================
// 通用文案
// ============================================================
export const COMMON = {
  confirm: '确认',
  cancel: '取消',
  close: '关闭',
  ok: '我知道了',
  gotIt: '知道了',
  tip: '提示',
  retry: '重试',
  backToHome: '返回首页',
  refresh: '刷新',
  copy: '复制',

  loading: '加载中…',
  submitting: '提交中…',
  sending: '发送中…',
  saving: '保存中…',
}

// ============================================================
// 页面标题 (definePageMeta)
// ============================================================
export const PAGE_META = {
  home: '首页',
  about: '了解愚者教会',
  departments: '全部部门',
  departmentsDesc: '选择一个你感兴趣的部门。',
  exam: '入会笔试',
  examResult: '笔试结果',
  site: '关于本站',
  badge: '工牌',
  support: '联络阿罗德斯',
  login: '登录',
}

// ============================================================
// 首页 (Home)
// ============================================================
export const HOME = {
  // Welcome messages
  welcomeUrgeExam: '{nickname}，请尽快完成入会笔试，部门正在等待你。',
  welcomeBack: '欢迎回来，{nickname}。',
  defaultNickname: '探索者',

  loadingText: '正在祈祷......',
  completedLabel: '你已完成测试 · 结果如下',
  completedTimeLabel: '完成时间',
  retakeLabel: '我不干了！我要跳槽！',
  churchName: '愚者教会',
  scrollDownLabel: '向下探索',
  cardsBackHome: '返回首页',

  // Cards section
  cardsJoinDate: '加入于 {date}',

  // Church intro card
  churchCardTitle: '了解愚者教会',
  churchCardCta: '探索',
  churchLinkText: '了解愚者教会',

  // Exam entry card
  examEntryTitle: '入会笔试',
  examEntryCompleted: '已完成',
  examEntryViewResult: '查看结果',
  examEntryRetake: '重新笔试',
  examEntryShare: '分享',
  examEntryNotCompleted: '开始笔试',
}

// ============================================================
// 笔试 (Exam)
// ============================================================
export const EXAM = {
  introTitle: '入会笔试',
  introBody: `欢迎来到愚者教会！<br>
请凭第一感觉作答，不要思考太久。<br><br>
作答过程中可以随时关闭页面，草稿会自动保存，愚者先生向来宽容。`,
  startBtn: '开始作答',

  progressAnswered: '题已作答',
  progressAriaLabel: '已答 {answered} / {total}',

  submitBtn: '提交答卷',
  submittingBtn: '提交中…',

  alertTitle: '别急',
  alertMessage: '（单片眼睛）你也想卡 bug？',
  identityLost: '用户身份丢失，请刷新页面重试',
}

// ============================================================
// 笔试结果 (Result)
// ============================================================
export const RESULT = {
  loadingTitle: '正在生成你的结果……',
  loadingSub: '后端全力绘图中（汗流浃背小周）',


  resultDescTemplate: '{nickname}，恭喜您已通过笔试，现分配至{deptName}部门',

  retryBtn: '重试',
  backHomeBtn: '返回首页',

  noResultId: '缺少结果标识',
  loadFailed: '结果加载失败',

  // Detail card
  joinedAtLabel: '加入于 {date}',
  retakeExam: '重新笔试',

  // Share card
  shareTitle: '分享结果',
  shareJoinedAt: '您已于{time}',
  shareDeptLabel: '入职{dept}的部门',
  shareQrLabel: '扫码入职愚者教会',
  shareGenerating: '画完你的 画你的(绘图时间较长，请稍后)',
  shareLongPressTip: '请长按下方图片，选择「保存到相册」',
  shareFailed: '分享图生成失败，请稍后重试。',
  shareSaveBtn: '保存图片',
  shareSavingBtn: '保存中…',
  shareDownloadName: '愚者教会-{dept}部门.png',

  // Amon cinematic captions
  amonCaption: '有趣，有趣',
}

// ============================================================
// 弹窗 (Modals)
// ============================================================
export const MODAL = {
  // Error modal
  errorTitle: '出 bug 啦！遭了蒙啦！',
  errorSubtitle: '页面遇到了一点小问题',
  errorRefresh: '刷新页面',
  errorFeedback: '向作者反馈',
  errorBack: '返回',
  errorFeedbackTitle: '向作者反馈',
  errorFeedbackPlaceholder: '描述你遇到的问题、想吐槽的点……',
  errorFeedbackSubmitting: '提交中…',
  errorFeedbackSubmit: '提交反馈',
  errorThanksTitle: '感谢您的反馈',
  errorThanksSubtitle: '我会好好改的 ♡',

  // Name input modal
  nameInputTitle: '留下你的姓名',
  nameInputPlaceholder: '请输入昵称',
  nameInputDoc: '（可选填写，此后可在阿罗德斯处修改）',

  // Staff password modal
  staffPasswordTitle: '通行口令',
  staffPasswordPlaceholder: '请输入口令',
  staffPasswordEmpty: '请输入口令',
  staffPasswordWrong: '口令错误',

  // Welcome modal
  welcomeTitle: '欢迎',

  // Confirm modal
  confirmDefault: '确认',
  cancelDefault: '取消',

  // Alert modal
  alertDefaultTitle: '提示',

  // Share card modal
  shareCardTitle: '分享结果',
  shareCardClose: '关闭',
  shareCardSaving: '保存中…',
  shareCardSave: '保存图片',
  shareCardGenerating: '画完你的 画你的(绘图时间较长，请稍后)',
  shareCardDownloadName: '愚者教会-{dept}部门.png',

  // Badge save modal
  badgeSaveTitle: '保存工牌',
  badgeSaveTip: '请长按下方图片，选择「保存到相册」',
  badgeSaveDesktopTip: '图片已生成，可直接保存或下载。',
  badgeSaveRendering: '真的努力再画了，稍等等QAQ',
  badgeSaveFailed: '工牌生成失败，请稍后重试。',
  badgeSaveDownloadAgain: '重新下载',
  badgeSaveDone: '完成',
  badgeCardAriaLabel: '工牌',

  // Avatar crop modal
  avatarCropTitle: '裁切头像',
  avatarCropTip: '拖动调整位置，双指或滚轮缩放',
  avatarCropCancel: '取消',
  avatarCropConfirm: '确定',

  // Modal dialog
  modalCloseAriaLabel: '关闭',
}

// ============================================================
// 工牌 (Badge)
// ============================================================
export const BADGE_COPY = {
  brandText: '愚者教会',
  brandSubText: 'CHURCH OF THE FOOL',
  footerBrand: '愚者教会',
  footerTextColor: '#ffffff',
  idColor: '#ffffff',

  formNicknamePlaceholder: '输入昵称',
  formIdPlaceholder: '输入编号',
  formRolePlaceholder: '输入职位',
  formExportBtn: '导出工牌',
  formExportingBtn: '导出中…',
  formSaveFailed: '保存失败，请稍后重试。',
  formInvalidFile: '请上传图片文件。',
  formExportSuffix: '工牌.png',
  defaultName: '周明瑞',
  defaultRole: '硬件工程师',
  formExportingTitle: '工牌绘制中',
  formExportingSub: '画完你的，画你的（确实很慢...)',
}

// ============================================================
// 导航 (Navigation)
// ============================================================
export const NAV_COPY = {
  home: '首页',
  about: '关于教会',
  departments: '部门大厅',
  exam: '入会笔试',
  result: '笔试结果',
  badge: '工牌',
  support: '阿罗德斯',
  site: '关于本站',
}

// ============================================================
// 部门页 (Departments)
// ============================================================
export const DEPARTMENT_COPY = {
  loading: '加载中…',
  memberTitle: '成员',
  noMembers: '暂无成员',
  totalMembers: '共 {count} 人',
  meBadge: '我',
  deptSuffix: '部门',
  memberCountSuffix: '人',

  myResultTitle: '你的笔试结果',
  joinedAt: '加入于 {date}',
  viewFullResult: '查看完整结果',
}

// ============================================================
// 员工后台 (Staff Console)
// ============================================================
export const STAFF_COPY = {
  title: '阿罗德斯回复台',
  tabMessages: '消息',
  tabFeedback: '用户反馈',
  logout: '退出',

  composerPlaceholder: '输入回复内容，Enter 发送，Shift+Enter 换行',
  composerHint: 'Shift+Enter 换行',
  composerSend: '发送',
  composerSending: '发送中…',

  draftBtn: '🪞 AI 起草回复',
  draftBtnLoading: '🪞 阿罗德斯思考中…',
  draftFailed: '生成草稿失败',

  noConversation: '← 选择左侧会话开始回复',
  noConversations: '暂无会话',
  needsReply: '待回复',
  noMessages: '暂无消息',

  timeJustNow: '刚刚',
  timeMinutesAgo: '{n}分钟前',
  timeHoursAgo: '{n}小时前',
  timeDaysAgo: '{n}天前',

  anonymousPrefix: '匿名 · ',

  feedbackCount: '共 {count} 条反馈',
  feedbackRefresh: '刷新',
  feedbackLoading: '加载中…',

  feedbackTypeBug: 'bug',
  feedbackTypeSuggestion: '建议',
  feedbackTypeOther: '其他',
}

// ============================================================
// 用户支持/阿罗德斯对话 (Support)
// ============================================================
export const SUPPORT_COPY = {
  title: '联络阿罗德斯',
  subtitle: '有什么想问的吗？',
  composerPlaceholder: '向阿罗德斯提问……',
  composerHint: '阿罗德斯正在镜中聆听……',
  errorPrefix: '阿罗德斯不在线: ',
}

// ============================================================
// 关于本站 (Site)
// ============================================================
export const SITE_COPY = {
  title: '关于本站',
  sectionDevNote: '制作组碎碎念',
  sectionContact: '联系我们',
  sectionAgreement: '用户服务协议',

  devNote: [
    '四月中旬，某两人正愉快地搓着CP32要发的无料，偶然刷到北京诡秘only即将举办的消息。恰逢各类人格测试风靡全网，究竟是谁最先提议搭建专属网站已无从考证，总之这个项目就这么如火如荼地开展起来了。',
    '这两位不知天高地厚的卷毛狒狒兴致勃勃、激情澎湃、如饥似渴地做好了初版产品文档，找好了画师投递了邀请，便以为大局已定、大事已成，悠哉游哉地前往 CP扫货。大抵是因为非凡特性聚合定律吧，我们就这样在二号馆遇上了主办（真的没有 0-08 发力吗），计划中的地摊也神奇地变成了现在的摊位（非常感谢主办们的信任和支持）。',
    '本以为只是个小项目，真正开工后才发现难题不断。一个月来，某程序员（真的是程序员）八点下班回家后还要猛敲代码，周末也再没有躺在床上摆烂或沉迷游戏的余裕（完全就是稿件上汗流浃背小周的状态）。某产品经理（被迫上岗的）也体验了一把从零开始的 PS 大学习，电脑上的各类文件比起写毕业论文时只多不少。直到五月底，本该完成的网站备案也迟迟办不下来（真的没有在传教啊），我们甚至都做好了最坏的打算：无法上线，就直接扛电脑去现场让大家玩。好在最后找到了替代的方法。',
    '磕磕绊绊之下，这版网站终于上线。它还有很大的优化空间，但已是我们倾尽心力完成的成果。希望大家玩得开心，如果碰到 bug、卡顿，或是有新点子、优化建议，都欢迎反馈！联系方式见上方。',
    '故事或有终章，但热爱永不落幕。山水有相逢，愿大家享受这场相聚，在这个小网站玩得愉快，也祝各位朋友三次元生活顺顺利利、万事随心！',
  ],
  devNoteClosing: '感谢相遇，也谢谢你看到这里。',

  disclaimerTitle: '免责声明',
  disclaimer: [
    '凡访问、使用本【愚者教会招聘网站】（以下简称本站）所有功能与服务的用户，即表示自愿同意本免责声明全部条款。若不认可任一条款，请立即停止使用本站服务。',
  ],
  section1Title: '一、服务性质说明',
  section1: [
    '1. 本站为个人非盈利纯娱乐整活网站，无任何商业用途，所有功能免费开放，不开展付费、广告、变现等商业活动。',
    '2. 本站全部内容基于《诡秘之主》IP进行二次趣味创作，纯属网友娱乐整活，非官方出品，与原作及官方无任何关联，不代表官方立场。',
    '3. 站内笔试、剧情、人设、部门匹配等所有内容均为虚构娱乐设定，无科学依据与现实参考价值，不具备任何测评、评判、指导效力。',
  ],
  section2Title: '二、版权与商用规范',
  section2: [
    '1. 本站严格禁止一切商用行为，用户不得搬运、篡改、二次加工本站内容用于盈利、引流、自媒体运营等商业用途，违规产生的一切责任由用户自行承担。',
    '2. 作品相关IP、角色名称等版权归原作者及官方所有，本站仅作非盈利娱乐分享。如有版权异议，可联系站长（QQ：1795037851），本站将第一时间整改或删除相关内容。',
  ],
  section3Title: '三、隐私与数据说明',
  section3: [
    '1. 本站通过时间戳生成临时UserID识别用户，仅存储站内虚拟昵称、笔试记录、部门信息等功能必需数据，不收集、不泄露、不售卖用户真实隐私信息。',
    '2. 用户可自行清除浏览器本地存储数据，数据清除后不可恢复，本站对此不承担任何责任。',
  ],
  section4Title: '四、用户行为责任',
  section4: [
    '1. 用户所有网站操作均为自主行为，因个人误操作、篡改本地数据、恶意利用漏洞BUG等违规行为造成的一切后果，由用户自行负责。',
    '2. 站内所有匹配结果、剧情内容仅供娱乐，用户不得因主观解读产生纠纷与争议，相关问题本站概不负责。',
  ],
  section5Title: '五、网站服务免责',
  section5: [
    '1. 本站为个人业余维护项目，不承诺永久稳定运行、功能零BUG，保留随时维护、改版、调整功能、重置数据、暂停服务的权利，对此产生的不便不承担任何赔偿责任。',
    '2. 站内联系方式、二维码、人物介绍等均为趣味设定，仅用于站内娱乐，不具备任何官方效力与现实引导作用。',
    '3. 因网络、设备、浏览器、第三方插件等外部问题导致的功能异常、数据丢失，本站不承担相关责任。',
  ],
  section6Title: '六、争议与更新',
  section6: [
    '1. 用户使用本站产生的一切间接损失、人际纠纷、精神困扰等，本站均不承担法律责任；第三方私自转载篡改内容引发的纠纷，由第三方自行承担。',
    '2. 本站有权随时修订本免责声明，修订后公示即生效，用户持续使用网站即视为认可最新条款。',
  ],
  disclaimerClosing: '本声明最终解释权归本站所有',

  contactQQPrefix: 'QQ：',
  contactCopy: '复制',
}

// ============================================================
// 阿蒙家族页 (Amon)
// ============================================================
export const AMON_COPY = {
  title: '阿蒙家族',
  recruitPrompt: '你真的不想当我的眷者么？',
  recruitReject: '跑了跑了',
  recruitAccept: '（戴上眼镜）',
  membersTitle: '家族成员',
  noMembers: '暂无成员',
  saveMe: '救救我愚者先生',
  storyText: `周遭一片死寂\n一声轻笑自脑海中传来，语调慵懒悠然：\n"欢迎来到阿蒙家族。"`,
  glassGone: '右眼的单片眼镜突然消失了',
  today: '今日 {time}',
  yesterday: '昨天 {time}',
  dayBefore: '前天 {time}',
  weekNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
}

// ============================================================
// 通用辅助函数：文案模板插值
// ============================================================
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}
