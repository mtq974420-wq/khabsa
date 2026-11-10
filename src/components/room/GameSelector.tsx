import React from 'react'
import { motion } from 'framer-motion'
import { GAME_INFO } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Users, X } from 'lucide-react'

interface GameSelectorProps {
  onSelect: (gameType: string) => void
  onClose: () => void
  playerCount: number
}

export const GameSelector: React.FC<GameSelectorProps> = ({ onSelect, onClose, playerCount }) => {
  const games = Object.values(GAME_INFO)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-3xl bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-purple-500/10">
          <h2 className="text-xl font-black text-white">اختر اللعبة</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 grid sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {games.map(game => {
            const canPlay = playerCount >= game.minPlayers
            return (
              <button
                key={game.id}
                onClick={() => canPlay && onSelect(game.id)}
                disabled={!canPlay}
                className={`flex items-center gap-4 p-4 rounded-xl border text-right transition-all ${
                  canPlay
                    ? 'hover:border-opacity-50 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                style={{
                  borderColor: `${game.color}30`,
                  background: `${game.color}05`,
                }}
                onMouseEnter={e => {
                  if (canPlay) {
                    (e.currentTarget as HTMLElement).style.borderColor = `${game.color}60`
                    ;(e.currentTarget as HTMLElement).style.background = `${game.color}10`
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${game.color}30`
                  ;(e.currentTarget as HTMLElement).style.background = `${game.color}05`
                }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${game.color}20` }}>
                  {game.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm">{game.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users size={10} />
                      {game.minPlayers}-{game.maxPlayers}
                    </span>
                    <span className="text-xs text-slate-500">⏱️ {game.avgDuration}</span>
                  </div>
                  {!canPlay && (
                    <span className="text-xs text-red-400 mt-1 block">
                      يحتاج {game.minPlayers} لاعبين على الأقل
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
