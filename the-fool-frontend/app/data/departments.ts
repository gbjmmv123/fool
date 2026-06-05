import type { DepartmentId } from '~/types/department'

const SHARE_IMAGE_URLS = {
  audrey: new URL('../static/share/audrey.png', import.meta.url).href,
  alger: new URL('../static/share/alger.png', import.meta.url).href,
  derrick: new URL('../static/share/derrick.png', import.meta.url).href,
  fors: new URL('../static/share/fors.png', import.meta.url).href,
  emlyn: new URL('../static/share/emlyn.png', import.meta.url).href,
  cattleya: new URL('../static/share/cattleya.png', import.meta.url).href,
  leonard: new URL('../static/share/leonard.png', import.meta.url).href,
  xio: new URL('../static/share/xio.png', import.meta.url).href,
} as const

export interface DepartmentStaticData {
  id: DepartmentId
  name: string
  themeColor: string
  description: string
  funFact: string
  shareImage: string
  officer: {
    name: string
    avatar: string
    gender: 'male' | 'female'
  }
}

export const DEPARTMENT_DATA: Record<DepartmentId, DepartmentStaticData> = {
  justice: {
    id: 'justice',
    name: '正义',
    themeColor: '#35af38',
    description: '洞察所有痛苦的安抚之人，于终末中托起美好的造梦者，真实与虚幻并存的精神导师，源于心灵和公平的正义，诡秘之主眷顾的谦卑医者。',
    funFact: '宠物友好部门，鼓励带狗狗上班',
    shareImage: SHARE_IMAGE_URLS.audrey,
    officer: { name: '奥黛丽·霍尔', avatar: '/static/avatars/audrey.png', gender: 'female' as const },
  },
  hangedman: {
    id: 'hangedman',
    name: '倒吊人',
    themeColor: '#0f96d4',
    description: '祭祀灾难的牧师，统御大海的主教，背负污秽和堕落的长老，行于诡秘阴影中的教皇，不惧牺牲与奉献的倒吊之人。',
    funFact: '偶遇长官唱歌强如怪物，拼尽全力无法忍耐，恐怖如斯',
    shareImage: SHARE_IMAGE_URLS.alger,
    officer: { name: '阿尔杰·威尔逊', avatar: '/static/avatars/alger.png', gender: 'male' as const },
  },
  sun: {
    id: 'sun',
    name: '太阳',
    themeColor: '#febf6c',
    description: '驱除黑暗的纯洁之人，所行皆为正义的祭司，追逐光明的歌颂者，时空之王的神官，永带希望和理想的温暖太阳。',
    funFact: '大主教阁下又长高了，都半神了还长高啊',
    shareImage: SHARE_IMAGE_URLS.derrick,
    officer: { name: '戴里克·伯格', avatar: '/static/avatars/derrick.png', gender: 'male' as const },
  },
  magician: {
    id: 'magician',
    name: '魔术师',
    themeColor: '#e9ac7b',
    description: '记录世界的法师，漫游星空的旅行者，打开黑暗宇宙的钥匙，黄黑之王的眷者，掌管道路与行动的魔术师。',
    funFact: '超乎想象的赶稿者，可供格尔曼驱使的友善生物',
    shareImage: SHARE_IMAGE_URLS.fors,
    officer: { name: '佛尔思·沃尔', avatar: '/static/avatars/fors.png', gender: 'female' as const },
  },
  moon: {
    id: 'moon',
    name: '月亮',
    themeColor: '#cb3755',
    description: '召唤之门的看守，万物灵性的化身，带来生命之血的创造者，滋养植物与动物的月亮，灵界支配者的神使。',
    funFact: '不是吸血鬼，是高贵的血族',
    shareImage: SHARE_IMAGE_URLS.emlyn,
    officer: { name: '埃姆林·怀特', avatar: '/static/avatars/emlyn.png', gender: 'male' as const },
  },
  hermit: {
    id: 'hermit',
    name: '隐者',
    themeColor: '#a779c3',
    description: '童话世界的巫师，窥探命运的眼睛，追随诡秘的贤者，藏于知识之中的神秘，富有智慧的隐者。',
    funFact: '主管，今天的午饭又是蘑菇配牛奶吗？',
    shareImage: SHARE_IMAGE_URLS.cattleya,
    officer: { name: '嘉德丽雅', avatar: '/static/avatars/cattleya.png', gender: 'female' as const },
  },
  star: {
    id: 'star',
    name: '星星',
    themeColor: '#d03f3f',
    description: '黑夜之中的守护者，看管恐惧的不眠天使，侍奉隐秘的暗夜诗人，命运道标上的光芒，为迷惑之人导引方向的星星。',
    funFact: '大海啊你全是水，女神啊你八条腿～',
    shareImage: SHARE_IMAGE_URLS.leonard,
    officer: { name: '伦纳德·米切尔', avatar: '/static/avatars/leonard.png', gender: 'male' as const },
  },
  judgement: {
    id: 'judgement',
    name: '审判',
    themeColor: '#fe8857',
    description: '狩猎混乱的骑士，律法和权威的代行者，秩序与阴影的平衡线，命运道标的惩戒之剑，检视自我的审判者。',
    funFact: '天王盖地虎，长官一米w...长官贼威武！',
    shareImage: SHARE_IMAGE_URLS.xio,
    officer: { name: '休·迪尔查', avatar: '/static/avatars/xio.png', gender: 'female' as const },
  },
}

export function getDepartmentData(id: string): DepartmentStaticData | null {
  return DEPARTMENT_DATA[id as DepartmentId] ?? null
}
