import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GAME_INFO } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GameType } from '@/types'
import { Users, Clock, Play, Info } from 'lucide-react'

export const GamesPage: React.FC = () => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<GameType | null>(null)
  const games = Object.values(GAME_INFO)
  const selectedGame = selected ? GAME_INFO[selected] : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-16 px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="purple" size="md" className="mb-4">🎮 مكتبة الألعاب</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">7 ألعاب حفلات</h1>
          <p className="text-slate-400 text-lg">اختر لعبتك وابدأ الخبصة!</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(game.id === selected ? null : game.id)}
              className={`cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${
                selected === game.id
                  ? 'scale-[1.02]'
                  : 'hover:-translate-y-1'
              }`}
              style={{
                background: 'linear-gradient(135deg, #12121f, #1a1a2e)',
                borderColor: selected === game.id ? game.color : 'rgba(124,58,237,0.15)',
                boxShadow: selected === game.id ? `0 0 30px ${game.color}30` : 'none',
              }}
            >
              <div className="h-1" style={{ background: `linear-gradient(90deg, ${game.color}, ${game.color}60)` }} />
              <div className="p-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ background: `${game.color}20` }}>
                  {game.emoji}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{game.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><Users size={11} /> {game.minPlayers}-{game.maxPlayers}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {game.avgDuration}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {game.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: `${game.color}15`, color: game.color }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  fullWidth
                  size="sm"
                  variant="primary"
                  leftIcon={<Play size={14} />}
                  onClick={e => { e.stopPropagation(); navigate('/create-room', { state: { gameType: game.id } }) }}
                  style={{ background: `linear-gradient(135deg, ${game.color}, ${game.color}bb)` }}
                >
                  العب الآن
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected game detail */}
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, #12121f, #1a1a2e)',
              borderColor: `${selectedGame.color}30`,
            }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl"
                  style={{ background: `${selectedGame.color}20` }}>
                  {selectedGame.emoji}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white mb-1">{selectedGame.name}</h2>
                <p className="text-slate-300 mb-4">{selectedGame.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-black" style={{ color: selectedGame.color }}>{selectedGame.minPlayers}-{selectedGame.maxPlayers}</p>
                    <p className="text-xs text-slate-400">لاعبين</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-lg font-black text-white">{selectedGame.avgDuration}</p>
                    <p className="text-xs text-slate-400">مدة اللعبة</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-lg font-black text-white">
                      {selectedGame.difficulty === 'easy' ? '⭐' : selectedGame.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedGame.difficulty === 'easy' ? 'سهل' : selectedGame.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="primary"
                    leftIcon={<Play size={18} />}
                    onClick={() => navigate('/create-room', { state: { gameType: selectedGame.id } })}
                    style={{ background: `linear-gradient(135deg, ${selectedGame.color}, ${selectedGame.color}bb)` }}
                  >
                    ابدأ لعبة
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
