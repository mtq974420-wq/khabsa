import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Room, RoomPlayer, GameSession } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Timer } from '@/components/ui/Timer'
import { Badge } from '@/components/ui/Badge'
import { pickRandom } from '@/lib/utils'
import { Crown } from 'lucide-react'

interface Props {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

const QUESTION_PAIRS = [
  {
    commonQuestion: 'ماذا تفعل في عطلة نهاية الأسبوع؟',
    outsiderQuestion: 'ماذا تفعل في أول يوم عمل؟',
    category: 'حياة يومية',
  },
  {
    commonQuestion: 'ما هو طعامك المفضل في الصيف؟',
    outsiderQuestion: 'ما هو طعامك المفضل في الشتاء؟',
    category: 'طعام',
  },
  {
    commonQuestion: 'كيف تقضي وقت الفراغ؟',
    outsiderQuestion: 'كيف تقضي وقت العمل؟',
    category: 'وقت',
  },
  {
    commonQuestion: 'ما أفضل شيء في السفر للبحر؟',
    outsiderQuestion: 'ما أفضل شيء في السفر للجبل؟',
    category: 'سفر',
  },
  {
    commonQuestion: 'ما أول شيء تفعله بعد الاستيقاظ؟',
    outsiderQuestion: 'ما آخر شيء تفعله قبل النوم؟',
    category: 'روتين',
  },
  {
    commonQuestion: 'ما أفضل هدية يمكن أن تتلقاها؟',
    outsiderQuestion: 'ما أسوأ هدية يمكن أن تتلقاها؟',
    category: 'هدايا',
  },
  {
    commonQuestion: 'صف حفلتك المثالية',
    outsiderQuestion: 'صف ليلتك المثالية بمفردك',
    category: 'ترفيه',
  },
  {
    commonQuestion: 'ما أشياء يجب أن تكون في أي مطبخ؟',
    outsiderQuestion: 'ما أشياء يجب أن تكون في أي سيارة؟',
    category: 'أشياء',
  },
]

type Phase = 'reveal_question' | 'answering' | 'discussion' | 'voting' | 'reveal' | 'game_end'

interface GameState {
  commonQuestion: string
  outsiderQuestion: string
  outsiderId: string
  phase: Phase
  round: number
  answers: Record<string, string>
  votes: Record<string, string>
  scores: Record<string, number>
}

export const MeenAtrash: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const pair = pickRandom(QUESTION_PAIRS)
    const outsider = players[Math.floor(Math.random() * players.length)]
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.user_id] = 0 })
    return {
      ...pair,
      outsiderId: outsider.user_id,
      phase: 'reveal_question',
      round: 1,
      answers: {},
      votes: {},
      scores,
    }
  })

  const [currentAnswer, setCurrentAnswer] = useState('')
  const [myVote, setMyVote] = useState<string | null>(null)
  const [winnerMsg, setWinnerMsg] = useState('')

  const isOutsider = gameState.outsiderId === currentUserId
  const myQuestion = isOutsider ? gameState.outsiderQuestion : gameState.commonQuestion

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return
    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentUserId]: currentAnswer.trim() }
    }))
    setCurrentAnswer('')
  }

  const handleVote = (targetId: string) => {
    if (myVote) return
    setMyVote(targetId)
    setGameState(prev => ({ ...prev, votes: { ...prev.votes, [currentUserId]: targetId } }))
  }

  const handleReveal = () => {
    const voteCounts: Record<string, number> = {}
    Object.values(gameState.votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1 })
    let maxId = '', maxCount = 0
    Object.entries(voteCounts).forEach(([id, c]) => { if (c > maxCount) { maxCount = c; maxId = id } })

    const caught = maxId === gameState.outsiderId
    const outsiderP = players.find(p => p.user_id === gameState.outsiderId)
    const newScores = { ...gameState.scores }

    if (caught) {
      players.forEach(p => {
        if (p.user_id !== gameState.outsiderId && gameState.votes[p.user_id] === gameState.outsiderId) {
          newScores[p.user_id] = (newScores[p.user_id] || 0) + 100
        }
      })
      setWinnerMsg(`تم كشف ${outsiderP?.display_name}! 🎉`)
    } else {
      newScores[gameState.outsiderId] = (newScores[gameState.outsiderId] || 0) + 150
      setWinnerMsg(`${outsiderP?.display_name} نجا! 😈`)
    }

    setGameState(prev => ({ ...prev, phase: 'reveal', scores: newScores }))
  }

  const startNextRound = () => {
    if (gameState.round >= room.settings.rounds) {
      setGameState(prev => ({ ...prev, phase: 'game_end' }))
      return
    }
    const pair = pickRandom(QUESTION_PAIRS)
    const outsider = players[Math.floor(Math.random() * players.length)]
    setGameState(prev => ({
      ...pair,
      outsiderId: outsider.user_id,
      phase: 'reveal_question',
      round: prev.round + 1,
      answers: {},
      votes: {},
      scores: prev.scores,
    }))
    setMyVote(null)
  }

  if (gameState.phase === 'reveal_question') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md w-full">
          <div className="text-6xl mb-4 animate-bounce">🎵</div>
          <h2 className="text-3xl font-black text-white mb-2">الجولة {gameState.round}</h2>
          <p className="text-slate-400 mb-8">سيُعطى كل شخص سؤالاً - واحد سؤاله مختلف!</p>

          <div className={`p-6 rounded-2xl mb-6 ${isOutsider ? 'bg-cyan-500/10 border-2 border-cyan-500/40' : 'bg-purple-500/10 border-2 border-purple-500/40'}`}>
            <div className="text-3xl mb-3">{isOutsider ? '🎵' : '🎵'}</div>
            <p className="text-sm text-slate-400 mb-2">سؤالك:</p>
            <p className="text-xl font-bold text-white">{myQuestion}</p>
            {isOutsider && (
              <Badge variant="electric" className="mt-3">سؤالك مختلف شوية!</Badge>
            )}
          </div>

          <Button fullWidth size="lg" variant="primary"
            onClick={() => setGameState(prev => ({ ...prev, phase: 'answering' }))}>
            جاهز للإجابة ✍️
          </Button>
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'answering') {
    const hasAnswered = !!gameState.answers[currentUserId]
    const totalAnswered = Object.keys(gameState.answers).length

    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">وقت الإجابة ✍️</h2>
              <p className="text-slate-400 text-sm">{totalAnswered}/{players.length} أجابوا</p>
            </div>
            <Timer duration={60} size="lg" color="electric"
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'discussion' }))} />
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400">سؤالك:</p>
            <p className="text-lg font-bold text-white mt-1">{myQuestion}</p>
          </div>

          {!hasAnswered ? (
            <div className="space-y-3">
              <textarea
                className="input-field min-h-24 resize-none"
                placeholder="اكتب إجابتك هنا..."
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                maxLength={150}
              />
              <Button fullWidth size="lg" variant="primary" onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                أرسل الإجابة
              </Button>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-green-400 font-semibold">تم! إجابتك: "{gameState.answers[currentUserId]}"</p>
              <p className="text-slate-400 text-sm mt-1">ينتظر بقية الإجابات...</p>
            </div>
          )}

          {/* Progress */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {players.map(p => (
              <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg ${
                gameState.answers[p.user_id] ? 'bg-green-500/10' : 'bg-white/[0.03]'
              }`}>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                <span className="text-xs text-white truncate">{p.display_name}</span>
                {gameState.answers[p.user_id] && <span className="text-green-400 ml-auto">✓</span>}
              </div>
            ))}
          </div>

          {isHost && (
            <Button fullWidth variant="electric" size="lg" className="mt-5"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'discussion' }))}>
              ابدأ النقاش ➡️
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'discussion') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">ناقشوا الإجابات 💬</h2>
            <Timer duration={60} size="lg" color="purple"
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'voting' }))} />
          </div>

          <div className="space-y-3 mb-6">
            {players.map(p => (
              <div key={p.id} className="flex items-start gap-3 p-4 bg-[#12121f] rounded-xl border border-purple-500/10">
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" isHost={p.is_host} />
                <div>
                  <p className="font-semibold text-white text-sm">{p.display_name}</p>
                  <p className="text-slate-300 mt-1">
                    {gameState.answers[p.user_id] || <span className="text-slate-500 italic">لم يجب</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {isHost && (
            <Button fullWidth variant="primary" size="lg"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'voting' }))}>
              انتقل للتصويت 🗳️
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'voting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">صوّت 🗳️</h2>
            <Timer duration={30} size="lg" color="electric" onComplete={handleReveal} />
          </div>

          {!myVote ? (
            <p className="text-slate-400 mb-4 text-sm text-center">صوّت على مين جاوب سؤال مختلف!</p>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
              <p className="text-green-400 text-sm">صوّتك سُجّل ✓</p>
            </div>
          )}

          <div className="grid gap-3">
            {players.filter(p => p.user_id !== currentUserId).map(p => (
              <button
                key={p.id}
                onClick={() => handleVote(p.user_id)}
                disabled={!!myVote}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  myVote === p.user_id
                    ? 'border-purple-500 bg-purple-500/15'
                    : myVote
                      ? 'border-white/5 opacity-50'
                      : 'border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5'
                }`}
              >
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="md" />
                <div className="flex-1 text-right">
                  <p className="font-semibold text-white">{p.display_name}</p>
                  {gameState.answers[p.user_id] && (
                    <p className="text-xs text-slate-400 truncate">{gameState.answers[p.user_id]}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {isHost && (
            <Button fullWidth variant="primary" size="lg" className="mt-5" onClick={handleReveal}>
              كشف النتيجة!
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'reveal') {
    const outsiderP = players.find(p => p.user_id === gameState.outsiderId)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">{winnerMsg.includes('نجا') ? '😈' : '🎉'}</div>
          <h2 className="text-3xl font-black text-white mb-4">{winnerMsg}</h2>

          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-6 mb-5">
            <p className="text-slate-400 mb-3">الأطرش كان:</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar color={outsiderP?.avatar_color || '#7c3aed'} emoji={outsiderP?.avatar_emoji || '🎵'} size="xl" />
              <span className="text-2xl font-bold text-white">{outsiderP?.display_name}</span>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-purple-500/10 rounded-xl p-3">
                  <p className="text-slate-400 mb-1">سؤال المجموعة:</p>
                  <p className="text-white font-medium">{gameState.commonQuestion}</p>
                </div>
                <div className="bg-cyan-500/10 rounded-xl p-3">
                  <p className="text-slate-400 mb-1">سؤال الأطرش:</p>
                  <p className="text-cyan-300 font-medium">{gameState.outsiderQuestion}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-5">
            {[...players].sort((a, b) => (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0)).map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                <span className="flex-1 text-sm text-white">{p.display_name}</span>
                <span className="text-amber-400 font-bold text-sm">{gameState.scores[p.user_id] || 0}</span>
              </div>
            ))}
          </div>

          {isHost && (
            <div className="flex gap-3">
              <Button fullWidth variant="primary" size="lg" onClick={startNextRound}>
                {gameState.round < room.settings.rounds ? 'جولة أخرى ➡️' : 'النتائج النهائية 🏆'}
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
    const winner = sorted[0]
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-white mb-6">انتهت اللعبة!</h2>
          <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 mb-5">
            <Crown size={32} className="text-amber-400 mx-auto mb-3" />
            <Avatar color={winner.avatar_color} emoji={winner.avatar_emoji} size="2xl" className="mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white">{winner.display_name}</h3>
            <p className="text-amber-400 text-lg">{gameState.scores[winner.user_id] || 0} نقطة</p>
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
