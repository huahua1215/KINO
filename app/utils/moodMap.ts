import type { MoodKey, MoodConfig } from '~/types/movie'

export const MOOD_MAP: Record<MoodKey, MoodConfig> = {
  friday_night: {
    label: '週五夜，一個人',
    emoji: '🌙',
    genres: [27, 53, 9648],
    voteAvgMin: 7.0,
    color: '#7B6DB8',
    gradient: 'from-[#7B6DB8]/20 via-[#2E374D]/10 to-transparent',
    description: '關燈，不要睡',
  },
  date_night: {
    label: '約會夜',
    emoji: '🥂',
    genres: [10749, 35],
    keywords: [9840, 244886],
    voteAvgMin: 6.5,
    color: '#B87A8A',
    gradient: 'from-[#B87A8A]/20 via-[#9E6A7A]/10 to-transparent',
    description: '讓對方記住這個夜晚',
  },
  family_time: {
    label: '跟家人一起看',
    emoji: '🏠',
    genres: [10751, 16, 35],
    voteAvgMin: 6.5,
    color: '#C8A882',
    gradient: 'from-[#C8A882]/20 via-[#BF9060]/10 to-transparent',
    description: '老少咸宜，笑聲滿屋',
  },
  need_a_cry: {
    label: '想大哭一場',
    emoji: '😭',
    genres: [18],
    keywords: [10614, 156924, 34265, 6564],
    color: '#7A8FA0',
    glowColor: '#00CFFF',
    gradient: 'from-[#7A8FA0]/20 via-[#637C8E]/10 to-transparent',
    description: '讓眼淚好好流出來',
  },
  feel_good: {
    label: '我要開心',
    emoji: '😄',
    genres: [35, 10402, 16],
    voteAvgMin: 6.5,
    color: '#C4A85C',
    glowColor: '#E0B84A',
    gradient: 'from-[#C4A85C]/20 via-[#7A6A4A]/10 to-transparent',
    description: '看完整個人都亮了',
  },
  epic_adventure: {
    label: '史詩冒險',
    emoji: '🚀',
    genres: [28, 12, 878],
    listId: 5955,
    color: '#B05A4A',
    gradient: 'from-[#B05A4A]/20 via-[#BF7A3A]/10 to-transparent',
    description: '震撼的大銀幕體驗',
  },
}

export const MOOD_KEYS = Object.keys(MOOD_MAP) as MoodKey[]
