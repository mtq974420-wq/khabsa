import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AVATAR_COLORS, AVATAR_EMOJIS } from '@/lib/constants'
import { getRankIcon, calculateWinRate } from '@/lib/utils'
import { Trophy, Zap, Users, TrendingUp } from 'lucide-react'

// Mock leaderboard data
const MOCK_PLAYERS = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  user_id: `player_${i}`,
  display_name: ['خبيص', 'بطل', 'أسطورة', 'نمر', 'جامد', 'حلو', 'مجنون', 'ذكي', 'سريع', 'قوي',
    'فارس', 'ملك', 'حكيم', 'مقاتل', 'معلم', 'وزير', 'سلطان', 'أمير', 'قائد', 'ثعلب'][i],
  avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  avatar_emoji: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
  total_points: Math.floor(10000 / (i * 0.5 + 1)),
  total_wins: Math.floor(100 / (i * 0.5 + 1)),
  total_games: Math.floor(150 / (i * 0.3 + 1) + 20),
}))

const PERIODS = [
  { id: 'all', label: 'كل الوقت' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'week', label: 'هذا الأسبوع' },
]

export const LeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState('all')

  const top3 = MOCK_PLAYERS.slice(0, 3)
  const rest = MOCK_PLAYERS.slice(3)

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-16 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-80 h-80 bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Badge variant="gold" size="md" className="mb-4">🏆 المتصدرون</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">قائمة الأبطال</h1>
          <p className="text-slate-400">تنافس على أعلى المراتب</p>
        </motion.div>

        {/* Period selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd place */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 flex-1">
            <Avatar color={top3[1].avatar_color} emoji={top3[1].avatar_emoji} size="xl" />
            <span className="text-sm font-bold text-white text-center">{top3[1].display_name}</span>
            <span className="text-xs text-amber-400">{top3[1].total_points.toLocaleString()}</span>
            <div className="w-full h-16 bg-gradient-to-t from-slate-600/50 to-slate-500/30 rounded-t-xl flex items-center justify-center">
              <span className="text-3xl font-black text-slate-300">🥈</span>
            </div>
          </motion.div>

          {/* 1st place */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            className="flex flex-col items-center gap-2 flex-1">
            <div className="text-3xl animate-bounce">👑</div>
            <Avatar color={top3[0].avatar_color} emoji={top3[0].avatar_emoji} size="2xl" />
            <span className="text-base font-black text-white text-center">{top3[0].display_name}</span>
            <span className="text-sm text-amber-400 font-bold">{top3[0].total_points.toLocaleString()}</span>
            <div className="w-full h-24 bg-gradient-to-t from-amber-600/50 to-amber-500/30 rounded-t-xl flex items-center justify-center">
              <span className="text-4xl font-black text-amber-300">🥇</span>
            </div>
          </motion.div>

          {/* 3rd place */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 flex-1">
            <Avatar color={top3[2].avatar_color} emoji={top3[2].avatar_emoji} size="xl" />
            <span className="text-sm font-bold text-white text-center">{top3[2].display_name}</span>
            <span className="text-xs text-amber-400">{top3[2].total_points.toLocaleString()}</span>
            <div className="w-full h-10 bg-gradient-to-t from-amber-800/40 to-amber-700/20 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl font-black text-amber-700">🥉</span>
            </div>
          </motion.div>
        </div>

        {/* Full list */}
        <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 text-xs text-slate-500 font-medium">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">اللاعب</div>
            <div className="col-span-2 text-center">النقاط</div>
            <div className="col-span-2 text-center">فوز%</div>
            <div className="col-span-2 text-center">ألعاب</div>
          </div>

          {rest.map((player, i) => (
            <motion.div
              key={player.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors items-center"
            >
              <div className="col-span-1 text-center text-sm font-bold text-slate-400">
                {getRankIcon(player.rank)}
              </div>
              <div className="col-span-5 flex items-center gap-2">
                <Avatar color={player.avatar_color} emoji={player.avatar_emoji} size="sm" />
                <span className="text-sm text-white truncate">{player.display_name}</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-amber-400">
                  {player.total_points.toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm text-emerald-400">
                  {calculateWinRate(player.total_wins, player.total_games)}%
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm text-slate-400">{player.total_games}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm mb-3">هل أنت في القائمة؟</p>
          <Button variant="primary" size="lg" leftIcon={<Trophy size={18} />} onClick={() => window.location.href = '/create-room'}>
            العب وكسب نقاط
          </Button>
        </div>
      </div>
    </div>
  )
}
