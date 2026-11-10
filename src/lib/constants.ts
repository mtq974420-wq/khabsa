import { GameType } from '@/types'

export const AVATAR_COLORS = [
  '#7c3aed', '#9f5cf7', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6',
  '#f97316', '#a855f7', '#6366f1', '#84cc16', '#fb923c',
]

export const AVATAR_EMOJIS = [
  '🎭', '👑', '🦁', '🐯', '🦊', '🐺', '🦅', '🦋', '🐉', '🦄',
  '🎪', '🎨', '🃏', '🎲', '🎯', '🏆', '⚡', '🔥', '💫', '🌙',
  '👾', '🤖', '🎮', '🕹️', '🎸', '🎵', '🌊', '🍀', '⚔️', '🧙',
]

export const GAME_INFO: Record<GameType, {
  id: GameType
  name: string
  nameEn: string
  description: string
  icon: string
  emoji: string
  color: string
  gradient: string
  minPlayers: number
  maxPlayers: number
  avgDuration: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}> = {
  meen_barra_salfa: {
    id: 'meen_barra_salfa',
    name: 'مين برا السالفة؟',
    nameEn: 'Who is the Outsider?',
    description: 'واحد ما يعرف السالفة - شو بيصير؟ حاول تكشف الغريب قبل ما يكشفك!',
    icon: '🕵️',
    emoji: '🕵️',
    color: '#7c3aed',
    gradient: 'from-purple-600 to-purple-900',
    minPlayers: 3,
    maxPlayers: 10,
    avgDuration: '10-15 دقيقة',
    difficulty: 'medium',
    tags: ['تخمين', 'خداع', 'نقاش'],
  },
  meen_atrash: {
    id: 'meen_atrash',
    name: 'مين الأطرش بالزفة؟',
    nameEn: 'Who Missed the Beat?',
    description: 'كل واحد عنده سؤال مختلف شوية - كشف مين ما سمع نفس السؤال!',
    icon: '🎵',
    emoji: '🎵',
    color: '#06b6d4',
    gradient: 'from-cyan-600 to-cyan-900',
    minPlayers: 3,
    maxPlayers: 8,
    avgDuration: '10-15 دقيقة',
    difficulty: 'medium',
    tags: ['تخمين', 'نقاش', 'ذكاء'],
  },
  meen_barra_rasma: {
    id: 'meen_barra_rasma',
    name: 'مين برا الرسمة؟',
    nameEn: 'Who Has the Different Picture?',
    description: 'معك صورة مختلفة؟ أو كلكم شايفين نفس الشي؟ وصّف بدون تبان!',
    icon: '🖼️',
    emoji: '🖼️',
    color: '#ec4899',
    gradient: 'from-pink-600 to-pink-900',
    minPlayers: 3,
    maxPlayers: 8,
    avgDuration: '10-15 دقيقة',
    difficulty: 'hard',
    tags: ['صور', 'تخمين', 'وصف'],
  },
  meen_ghalban: {
    id: 'meen_ghalban',
    name: 'مين غالباً؟',
    nameEn: 'Most Likely To?',
    description: 'صوّت مين في المجموعة اللي غالباً يعمل هالشي - الأكثر أصوات يكسب!',
    icon: '🏆',
    emoji: '🏆',
    color: '#f59e0b',
    gradient: 'from-amber-600 to-amber-900',
    minPlayers: 3,
    maxPlayers: 12,
    avgDuration: '5-10 دقائق',
    difficulty: 'easy',
    tags: ['تصويت', 'مرح', 'اجتماعي'],
  },
  mamnoo3_tahki: {
    id: 'mamnoo3_tahki',
    name: 'ممنوع تحكي!',
    nameEn: 'Forbidden Words!',
    description: 'فسّر الكلمة لفريقك بدون ما تحكي الكلمات الممنوعة - سباق بين الفريقين!',
    icon: '🚫',
    emoji: '🚫',
    color: '#ef4444',
    gradient: 'from-red-600 to-red-900',
    minPlayers: 4,
    maxPlayers: 12,
    avgDuration: '15-20 دقيقة',
    difficulty: 'medium',
    tags: ['فرق', 'تفسير', 'سرعة'],
  },
  tahadi_soraa: {
    id: 'tahadi_soraa',
    name: 'تحدي السرعة',
    nameEn: 'Speed Challenge',
    description: 'اسئلة سريعة - مين بجاوب صح وأسرع يكسب النقاط! تنافس مع الكل!',
    icon: '⚡',
    emoji: '⚡',
    color: '#10b981',
    gradient: 'from-emerald-600 to-emerald-900',
    minPlayers: 2,
    maxPlayers: 10,
    avgDuration: '10 دقائق',
    difficulty: 'easy',
    tags: ['سرعة', 'معلومات', 'تنافس'],
  },
  irsom_w_khamen: {
    id: 'irsom_w_khamen',
    name: 'ارسم وخمّن',
    nameEn: 'Draw & Guess',
    description: 'ارسم الكلمة ولا تحكي! شوف مين يخمّن أسرع - فنانين وما فنانين!',
    icon: '🎨',
    emoji: '🎨',
    color: '#8b5cf6',
    gradient: 'from-violet-600 to-violet-900',
    minPlayers: 3,
    maxPlayers: 8,
    avgDuration: '15-20 دقيقة',
    difficulty: 'easy',
    tags: ['رسم', 'تخمين', 'إبداع'],
  },
}

export const ROOM_CODES_LENGTH = 6

export const DEFAULT_ROOM_SETTINGS = {
  rounds: 5,
  round_duration: 60,
  voting_duration: 30,
  allow_spectators: true,
  auto_start: false,
}

export const POINTS = {
  CORRECT_GUESS: 100,
  FAST_BONUS: 50,
  OUTSIDER_SURVIVES: 150,
  CATCH_OUTSIDER: 100,
  DRAW_GUESS: 100,
  DRAW_DRAWER_BONUS: 25,
  FORBIDDEN_WORD_CORRECT: 50,
  SPEED_BASE: 100,
  SPEED_TIME_BONUS: 50,
}

export const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]
