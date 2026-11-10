import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AVATAR_COLORS, AVATAR_EMOJIS, ROOM_CODES_LENGTH } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < ROOM_CODES_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generateGuestName(): string {
  const adjectives = [
    'مجنون', 'شاطر', 'بارد', 'حلو', 'جامد', 'نفسي', 'خبيص', 'ذكي', 'سريع', 'قوي'
  ]
  const nouns = [
    'لاعب', 'بطل', 'فارس', 'أسد', 'نمر', 'ثعلب', 'حكيم', 'مقاتل', 'معلم', 'ملك'
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 999) + 1
  return `${adj}_${noun}${num}`
}

export function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export function getRandomAvatarEmoji(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)]
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}ث`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  return `منذ ${days} يوم`
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function pickRandomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function vibrate(pattern: number | number[]) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export function getRankColor(rank: number): string {
  if (rank === 1) return '#f59e0b'
  if (rank === 2) return '#94a3b8'
  if (rank === 3) return '#cd7c54'
  return '#475569'
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

export function pointsToLevel(points: number): { level: number; title: string; nextLevelPoints: number } {
  const levels = [
    { min: 0, title: 'مبتدئ' },
    { min: 500, title: 'لاعب' },
    { min: 1500, title: 'محترف' },
    { min: 3000, title: 'خبير' },
    { min: 6000, title: 'بطل' },
    { min: 10000, title: 'أسطورة' },
    { min: 20000, title: 'خرافي' },
  ]
  
  let level = 1
  let nextLevelPoints = 500
  let title = 'مبتدئ'
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].min) {
      level = i + 1
      title = levels[i].title
      nextLevelPoints = i < levels.length - 1 ? levels[i + 1].min : levels[i].min
      break
    }
  }
  
  return { level, title, nextLevelPoints }
}
