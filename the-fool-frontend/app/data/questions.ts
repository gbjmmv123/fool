import type { DepartmentId } from '~/types/department'

export const EXAM_VERSION = 'v3'

export interface ExamOption {
  id: string
  label: string
  weights: Partial<Record<DepartmentId, number>>
}

export interface ExamQuestion {
  id: string
  title: string
  options: ExamOption[]
  specialType?: 'amon-final'
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q1',
    title: '你在地下非凡聚会遇到人售卖不知真假的罗塞尔笔记。你会：',
    options: [
      { id: 'a', label: '检查物品真伪，评估其实际价值，然后狠狠砍价', weights: { hangedman: 1, hermit: 1, judgement: 1 } },
      { id: 'b', label: '直接买下，宁可买错不能错过', weights: { justice: 1, sun: 1 } },
      { id: 'c', label: '犹豫不决，打算先探明卖家来历再下手', weights: { magician: 1, moon: 1, star: 1 } },
    ],
  },
  {
    id: 'q2',
    title: '在你在执行任务时，意外获得了一件强大的封印物，但它有非常严重的负面效果。你会：',
    options: [
      { id: 'a', label: '立刻上交给教会，由专业人士处理', weights: { star: 1, judgement: 1, justice: 1, sun: 1 } },
      { id: 'b', label: '把它卖给黑市，换取自己需要的资源', weights: { moon: 1, magician: 1 } },
      { id: 'c', label: '把它藏起来，尝试研究如何控制它的负面效果', weights: { hangedman: 1, hermit: 1 } },
    ],
  },
  {
    id: 'q3',
    title: '你不小心在朋友面前暴露了自己非凡者的身份，你会：',
    options: [
      { id: 'a', label: '立刻更换身份，转移到安全的地方', weights: { hangedman: 1, judgement: 1, hermit: 1 } },
      { id: 'b', label: '向朋友坦白，请求他们的理解', weights: { magician: 1, justice: 1 } },
      { id: 'c', label: '假装什么都没发生，继续过原来的生活', weights: { moon: 1, star: 1, sun: 1 } },
    ],
  },
  {
    id: 'q4',
    title: '你看中了一件非常稀缺的非凡材料，但老板开的价格远高于你的心理预期。你会：',
    options: [
      { id: 'a', label: '列出这件材料的所有缺点，和老板讨价还价直到满意', weights: { hangedman: 1, hermit: 1, judgement: 1 } },
      { id: 'b', label: '如果真的很需要，就咬牙买下来', weights: { justice: 1, sun: 1 } },
      { id: 'c', label: '转身就走，反正总会有别的替代品', weights: { magician: 1, moon: 1, star: 1 } },
    ],
  },
  {
    id: 'q5',
    title: '一个你认识的普通人不小心卷入了非凡事件，被官方非凡者组织通缉，你会：',
    options: [
      { id: 'a', label: '一起分析事件经过，帮助他向官方非凡者澄清', weights: { star: 1, judgement: 1, sun: 1 } },
      { id: 'b', label: '协助他逃避官方非凡者的抓捕，伺机跑路', weights: { hangedman: 1, hermit: 1, moon: 1 } },
      { id: 'c', label: '尊重他的选择，给予适当的帮助', weights: { justice: 1, magician: 1 } },
    ],
  },
  {
    id: 'q6',
    title: '你发现你的朋友一直在隐瞒一个重大秘密，而且这个秘密可能会有很大的安全隐患。你会：',
    options: [
      { id: 'a', label: '直接向他表明，要求他做出解释', weights: { sun: 1, star: 1 } },
      { id: 'b', label: '认为朋友陷入大麻烦，向官方寻求帮助', weights: { justice: 1, magician: 1, judgement: 1 } },
      { id: 'c', label: '偷偷调查这个秘密，自己找出真相', weights: { hermit: 1, moon: 1, hangedman: 1 } },
    ],
  },
  {
    id: 'q7',
    title: '你偶然结识了一个强大的非官方非凡者，他邀请你加入他的非凡者集会。你会倾向于：',
    options: [
      { id: 'a', label: '答应，因为这是一个难得的机会', weights: { sun: 1, moon: 1, star: 1 } },
      { id: 'b', label: '拒绝，因为你不想卷入更多的麻烦', weights: { hermit: 1, magician: 1, judgement: 1 } },
      { id: 'c', label: '假装答应，然后暗中调查这个组织', weights: { justice: 1, hangedman: 1 } },
    ],
  },
  {
    id: 'q8',
    title: '你在一家非凡者酒吧喝酒，邻桌有人在激烈争论一个神秘学问题，你会：',
    options: [
      { id: 'a', label: '认真听他们争论，在有人问到时发表意见', weights: { sun: 1, star: 1, hermit: 1 } },
      { id: 'b', label: '换一个离他们远一点的位置，不想被打扰', weights: { moon: 1, judgement: 1 } },
      { id: 'c', label: '默默听着，但不参与任何讨论', weights: { justice: 1, hangedman: 1, magician: 1 } },
    ],
  },
  {
    id: 'q9',
    title: '你准备去南大陆进行一次长期冒险，你会提前多久开始准备：',
    options: [
      { id: 'a', label: '提前三个月，列出详细的清单，准备好所有可能需要的物品', weights: { sun: 1, hangedman: 1, hermit: 1 } },
      { id: 'b', label: '提前一周，准备好主要的装备和物资', weights: { justice: 1, moon: 1, judgement: 1 } },
      { id: 'c', label: '提前一天，随便收拾几件衣服和必需品就出发', weights: { magician: 1, star: 1 } },
    ],
  },
  {
    id: 'q10',
    title: '连续执行了一周的任务后，你最想怎么放松：',
    options: [
      { id: 'a', label: '组织一场派对，邀请所有朋友参加', weights: { star: 1, justice: 1, judgement: 1 } },
      { id: 'b', label: '和几个好朋友一起吃饭聊天', weights: { sun: 1, magician: 1 } },
      { id: 'c', label: '一个人待着，彻底放空自己', weights: { hangedman: 1, hermit: 1, moon: 1 } },
    ],
  },
  {
    id: 'q11',
    title: '你的上司给你布置了一个任务，但没有说明具体怎么做，你会：',
    options: [
      { id: 'a', label: '询问详细的步骤和要求，确保自己完全理解', weights: { sun: 1, star: 1, moon: 1 } },
      { id: 'b', label: '参考之前类似任务的做法，按部就班地完成', weights: { hangedman: 1, judgement: 1 } },
      { id: 'c', label: '聚焦任务本质，思考可行方向，自主规划做法', weights: { magician: 1, hermit: 1, justice: 1 } },
    ],
  },
  {
    id: 'q12',
    title: '当有人向你描述一个复杂的非凡概念时，你更容易理解的是：',
    options: [
      { id: 'a', label: '搭配具体实例和步骤说明的内容', weights: { hangedman: 1, sun: 1, moon: 1 } },
      { id: 'b', label: '依靠逻辑推演、层层论证的内容', weights: { hermit: 1, judgement: 1 } },
      { id: 'c', label: '使用隐喻、象征、意象诠释的内容', weights: { justice: 1, magician: 1, star: 1 } },
    ],
  },
  {
    id: 'q13',
    title: '你在存放自己的非凡材料和物品时，你会：',
    options: [
      { id: 'a', label: '按照种类、用途和危险等级严格分类，贴上标签', weights: { justice: 1, sun: 1, hermit: 1 } },
      { id: 'b', label: '简单分区摆放，优先把常用物品放在顺手位置', weights: { hangedman: 1, judgement: 1 } },
      { id: 'c', label: '不刻意规整，随意放置，用到时再慢慢翻找', weights: { magician: 1, moon: 1, star: 1 } },
    ],
  },
  {
    id: 'q14',
    title: '你在规划自己的非凡之路时，更倾向于：',
    options: [
      { id: 'a', label: '制定详尽的晋升计划，并严格执行', weights: { hangedman: 1, hermit: 1, judgement: 1 } },
      { id: 'b', label: '确定大致的长期目标，根据情况灵活调整', weights: { sun: 1, justice: 1 } },
      { id: 'c', label: '不做固定规划，把握眼前出现的机遇', weights: { magician: 1, moon: 1, star: 1 } },
    ],
  },
  {
    id: 'q15',
    title: '当你需要批评一个犯错的队友时，你会：',
    options: [
      { id: 'a', label: '直言问题对错，不刻意顾及情绪', weights: { hangedman: 1, hermit: 1, star: 1 } },
      { id: 'b', label: '委婉地指出问题，就事论事', weights: { justice: 1, moon: 1, judgement: 1 } },
      { id: 'c', label: '给出改进建议，注意分寸', weights: { sun: 1, magician: 1 } },
    ],
  },
  {
    id: 'q16',
    title: '你刚回到家，发现赢家 恩尤尼坐在沙发上，微笑地问，"你愿意当我的眷者吗？"你的反应：',
    specialType: 'amon-final',
    options: [
      { id: 'a', label: '好呀好呀', weights: {} },
      { id: 'b', label: '列奥德罗!!!!!', weights: {} },
      { id: 'c', label: '纸人替身 火焰跳跃 历史孔隙 ......', weights: {} },
    ],
  },
]
