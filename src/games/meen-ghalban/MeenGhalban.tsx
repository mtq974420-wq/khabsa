import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Room, RoomPlayer, GameSession } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Timer } from '@/components/ui/Timer'
import { Crown } from 'lucide-react'
import { pickRandom } from '@/lib/utils'

interface Props {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

const QUESTIONS = [
  'مين غالباً ينسى اسم أشخاص التو ما التقى فيهم؟',
  'مين غالباً يوصل متأخر لكل شي؟',
  'مين غالباً يضحك بأعلى صوت؟',
  'مين غالباً يمشي لآخر لحظة قبل ما يقرر؟',
  'مين غالباً يأكل أكثر من غيره؟',
  'مين غالباً يخسر المفاتيح والهاتف؟',
  'مين غالباً يشوف مسلسلات بدون ما ينام؟',
  'مين غالباً يتكلم أكثر شخص في المجموعة؟',
  'مين غالباً يغسل الصحون بدون ما يُطلب منه؟',
  'مين غالباً يسافر لأماكن غريبة؟',
  'مين غالباً يصحى مبكر جداً؟',
  'مين غالباً يرسل أطول رسالة واتساب؟',
  'مين غالباً يقود بأسرع سرعة؟',
  'مين غالباً يصور أكثر صور في أي نشاط؟',
  'مين غالباً ينام في الحفلات؟',
  'مين غالباً يشتري أشياء ما يحتاجها؟',
  'مين غالباً يغني بدون موسيقى؟',
  'مين غالباً يتبرع لأي شي؟',
  'مين غالباً يبكي في الأفلام؟',
  'مين غالباً يقود الجماعة بأي نشاط؟',
]

type Phase = 'question' | 'voting' | 'reveal' | 'round_end' | 'game_end'

interface GameState {
  question: string
  phase: Phase
  round: number
  votes: Record<string, string>
  scores: Record<string, number>
  usedQuestions: string[]
}

export const MeenGhalban: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const question = pickRandom(QUESTIONS)
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.user_id] = 0 })
    return {
      question,
      phase: 'question',
      round: 1,
      votes: {},
      scores,
      usedQuestions: [question],
    }
  })

  const [myVote, setMyVote] = useState<string | null>(null)
  const [result, setResult] = useState<{ winnerId: string; votes: number } | null>(null)

  const handleVote = (targetId: string) => {
    if (myVote) return
    setMyVote(targetId)
    setGameState(prev => ({
      ...prev,
      votes: { ...prev.votes, [currentUserId]: targetId }
    }))
  }

  const calculateResult = () => {
    const voteCounts: Record<string, number> = {}
    Object.values(gameState.votes).forEach(v => {
      voteCounts[v] = (voteCounts[v] || 0) + 1
    })

    let maxVotes = 0
    let winnerId = ''
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        winnerId = id
      }
    })

    const newScores = { ...gameState.scores }
    newScores[winnerId] = (newScores[winnerId] || 0) + (maxVotes * 50)

    setResult({ winnerId, votes: maxVotes })
    setGameState(prev => ({ ...prev, phase: 'reveal', scores: newScores }))
  }

  const nextRound = () => {
    if (gameState.round >= room.settings.rounds) {
      setGameState(prev => ({ ...prev, phase: 'game_end' }))
      return
    }

    const available = QUESTIONS.filter(q => !gameState.usedQuestions.includes(q))
    const nextQ = available.length > 0 ? pickRandom(available) : pickRandom(QUESTIONS)

    setGameState(prev => ({
      question: nextQ,
      phase: 'question',
      round: prev.round + 1,
      votes: {},
      scores: prev.scores,
      usedQuestions: [...prev.usedQuestions, nextQ],
    }))
    setMyVote(null)
    setResult(null)
  }

  if (gameState.phase === 'question') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">مين غالباً؟ 🏆</h2>
              <p className="text-slate-400 text-sm">الجولة {gameState.round} من {room.settings.rounds}</p>
            </div>
            <div className="text-3xl font-black text-amber-400">{gameState.round}/{room.settings.rounds}</div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-8 mb-6 text-center"
          >
            <div className="text-5xl mb-4">🤔</div>
            <h3 className="text-2xl font-bold text-white leading-relaxed">{gameState.question}</h3>
          </motion.div>

          <p className="text-slate-400 text-center text-sm mb-6">صوّت على شخص من المجموعة!</p>

          <div className="grid grid-cols-2 gap-3">
            {players.map(p => {
              const isMe = p.user_id === currentUserId
              const voted = myVote === p.user_id
              const votesFor = Object.values(gameState.votes).filter(v => v === p.user_id).length

              return (
                <button
                  key={p.id}
                  onClick={() => handleVote(p.user_id)}
                  disabled={!!myVote}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    voted
                      ? 'border-amber-500 bg-amber-500/15 scale-[1.02]'
                      : myVote
                        ? 'border-white/5 opacity-40 cursor-not-allowed'
                        : 'border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer'
                  }`}
                >
                  <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="lg" isHost={p.is_host} />
                  <span className="text-sm font-medium text-white text-center">
                    {p.display_name}{isMe ? ' (أنت)' : ''}
                  </span>
                  {votesFor > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(votesFor, 5) }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {myVote && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
              <p className="text-amber-400 text-sm">صوّتك سُجّل ✓</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>{Object.keys(gameState.votes).length}/{players.length} صوّتوا</span>
          </div>

          {isHost && (
            <Button fullWidth variant="gold" size="lg" className="mt-5" onClick={calculateResult}>
              كشف النتيجة 🎉
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'reveal' && result) {
    const winner = players.find(p => p.user_id === result.winnerId)
    const voteCounts: Record<string, number> = {}
    Object.values(gameState.votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1 })

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <p className="text-slate-400 mb-2 text-lg">{gameState.question}</p>

          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/40 rounded-2xl p-6 mb-6">
            <Avatar color={winner?.avatar_color || '#f59e0b'} emoji={winner?.avatar_emoji || '🏆'} size="2xl" className="mx-auto mb-3" />
            <h2 className="text-3xl font-black text-white">{winner?.display_name}</h2>
            <p className="text-amber-400 mt-1">{result.votes} من {players.length} أصوات</p>
            <div className="mt-3 w-full bg-black/30 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                style={{ width: `${(result.votes / players.length) * 100}%` }}
              />
            </div>
          </div>

          {/* All votes breakdown */}
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">توزيع الأصوات</h3>
            {players
              .sort((a, b) => (voteCounts[b.user_id] || 0) - (voteCounts[a.user_id] || 0))
              .map(p => (
                <div key={p.id} className="flex items-center gap-3 py-1.5">
                  <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                  <span className="text-sm text-white flex-1 text-right">{p.display_name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: voteCounts[p.user_id] || 0 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-amber-400" />
                    ))}
                  </div>
                  <span className="text-amber-400 text-sm font-bold w-8 text-center">{voteCounts[p.user_id] || 0}</span>
                </div>
              ))}
          </div>

          {isHost && (
            <div className="flex gap-3">
              <Button fullWidth variant="gold" size="lg" onClick={nextRound}>
                {gameState.round < room.settings.rounds ? 'سؤال آخر ➡️' : 'النتائج النهائية 🏆'}
              </Button>
              <Button variant="ghost" size="lg" onClick={onBackToLobby}>الغرفة</Button>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'game_end') {
    const sorted = [...players].sort((a, b) => (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0))
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-white mb-6">انتهت اللعبة!</h2>
          <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 mb-5">
            <Crown size={32} className="text-amber-400 mx-auto mb-3" />
            <Avatar color={sorted[0].avatar_color} emoji={sorted[0].avatar_emoji} size="2xl" className="mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white">{sorted[0].display_name}</h3>
            <p className="text-amber-400 text-lg">{gameState.scores[sorted[0].user_id] || 0} نقطة</p>
            <p className="text-slate-400 text-sm mt-1">الشخص الأكثر "غالباً" 😄</p>
          </div>
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-5">
            {sorted.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                <span className="flex-1 text-sm text-white">{p.display_name}</span>
                <span className="text-amber-400 font-bold">{gameState.scores[p.user_id] || 0}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button fullWidth variant="primary" size="lg" onClick={() => window.location.reload()}>لعبة جديدة</Button>
            <Button fullWidth variant="ghost" size="lg" onClick={onBackToLobby}>الغرفة</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
