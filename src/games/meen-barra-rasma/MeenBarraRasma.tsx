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

// Picture pairs using descriptive prompts (since we can't host images, we show emoji representations)
const PICTURE_PAIRS = [
  {
    common: { emoji: '🌊🏖️', desc: 'شاطئ في الصيف مع أشخاص يلعبون', category: 'طبيعة' },
    outsider: { emoji: '🏔️❄️', desc: 'جبال مثلجة في الشتاء', category: 'طبيعة' },
  },
  {
    common: { emoji: '🍕🍝', desc: 'مطعم إيطالي مشهور', category: 'طعام' },
    outsider: { emoji: '🍣🥢', desc: 'مطعم ياباني راقي', category: 'طعام' },
  },
  {
    common: { emoji: '🎸🎤', desc: 'حفلة موسيقية روك في ملعب كبير', category: 'ترفيه' },
    outsider: { emoji: '🎹🎼', desc: 'حفلة موسيقى كلاسيكية في دار أوبرا', category: 'ترفيه' },
  },
  {
    common: { emoji: '🦁🌿', desc: 'أسد في السافانا الأفريقية', category: 'حيوانات' },
    outsider: { emoji: '🐯🌲', desc: 'نمر في الغابة الاستوائية', category: 'حيوانات' },
  },
  {
    common: { emoji: '🏙️🌃', desc: 'مدينة ليلية بأضواء براقة', category: 'مدن' },
    outsider: { emoji: '🌅🏘️', desc: 'قرية صغيرة عند الغروب', category: 'مدن' },
  },
  {
    common: { emoji: '⚽🏟️', desc: 'مباراة كرة قدم في ملعب ضخم', category: 'رياضة' },
    outsider: { emoji: '🏀🏟️', desc: 'مباراة كرة سلة في صالة رياضية', category: 'رياضة' },
  },
]

type Phase = 'reveal_image' | 'describing' | 'discussion' | 'voting' | 'reveal' | 'game_end'

interface GameState {
  pairIndex: number
  outsiderId: string
  phase: Phase
  round: number
  descriptions: Record<string, string>
  votes: Record<string, string>
  scores: Record<string, number>
}

export const MeenBarraRasma: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const pairIndex = Math.floor(Math.random() * PICTURE_PAIRS.length)
    const outsider = players[Math.floor(Math.random() * players.length)]
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.user_id] = 0 })
    return {
      pairIndex,
      outsiderId: outsider.user_id,
      phase: 'reveal_image',
      round: 1,
      descriptions: {},
      votes: {},
      scores,
    }
  })

  const [currentDesc, setCurrentDesc] = useState('')
  const [myVote, setMyVote] = useState<string | null>(null)
  const [winnerMsg, setWinnerMsg] = useState('')
  const [imageRevealed, setImageRevealed] = useState(false)

  const isOutsider = gameState.outsiderId === currentUserId
  const currentPair = PICTURE_PAIRS[gameState.pairIndex]
  const myImage = isOutsider ? currentPair.outsider : currentPair.common

  const handleDescSubmit = () => {
    if (!currentDesc.trim()) return
    setGameState(prev => ({
      ...prev,
      descriptions: { ...prev.descriptions, [currentUserId]: currentDesc.trim() }
    }))
    setCurrentDesc('')
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
    const pairIndex = Math.floor(Math.random() * PICTURE_PAIRS.length)
    const outsider = players[Math.floor(Math.random() * players.length)]
    setGameState(prev => ({
      pairIndex,
      outsiderId: outsider.user_id,
      phase: 'reveal_image',
      round: prev.round + 1,
      descriptions: {},
      votes: {},
      scores: prev.scores,
    }))
    setMyVote(null)
    setImageRevealed(false)
  }

  if (gameState.phase === 'reveal_image') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🖼️</div>
          <h2 className="text-3xl font-black text-white mb-2">الجولة {gameState.round}</h2>
          <p className="text-slate-400 mb-8">انظر لصورتك - لا تكشف للثانيين!</p>

          {!imageRevealed ? (
            <button onClick={() => setImageRevealed(true)}
              className="w-full py-8 rounded-2xl border-2 border-dashed border-pink-500/50 hover:border-pink-500 hover:bg-pink-500/5 transition-all">
              <div className="text-4xl mb-3">👁️</div>
              <p className="text-pink-300 text-lg font-semibold">اضغط لرؤية صورتك</p>
              <p className="text-slate-500 text-sm mt-1">تأكد أن أحد ما يشوف شاشتك</p>
            </button>
          ) : (
            <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}
              className={`p-8 rounded-2xl ${isOutsider ? 'bg-cyan-500/10 border-2 border-cyan-500/40' : 'bg-pink-500/10 border-2 border-pink-500/40'}`}>
              <div className="text-7xl mb-4">{myImage.emoji}</div>
              <p className="text-slate-300 font-medium">{myImage.desc}</p>
              {isOutsider && <Badge variant="electric" className="mt-3">صورتك مختلفة!</Badge>}
            </motion.div>
          )}

          {imageRevealed && (
            <Button fullWidth size="lg" variant="primary" className="mt-6"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'describing' }))}>
              ابدأ الوصف 🗣️
            </Button>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'describing') {
    const hasDesc = !!gameState.descriptions[currentUserId]
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">صف صورتك 🗣️</h2>
            <Timer duration={60} size="lg" color="electric"
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'discussion' }))} />
          </div>

          <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mb-5 flex items-center gap-4">
            <div className="text-4xl">{myImage.emoji}</div>
            <p className="text-white font-medium text-sm">صف ما تشوفه بكلمة أو جملة قصيرة - بدون تفاصيل كثير!</p>
          </div>

          {!hasDesc ? (
            <div className="space-y-3">
              <textarea className="input-field min-h-20 resize-none" placeholder="صف صورتك هنا..."
                value={currentDesc} onChange={e => setCurrentDesc(e.target.value)} maxLength={100} />
              <Button fullWidth variant="primary" size="lg" onClick={handleDescSubmit} disabled={!currentDesc.trim()}>
                أرسل الوصف
              </Button>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 font-semibold">✅ وصفك: "{gameState.descriptions[currentUserId]}"</p>
              <p className="text-slate-400 text-sm mt-1">ينتظر الثانيين...</p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            {players.map(p => (
              <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg ${gameState.descriptions[p.user_id] ? 'bg-green-500/10' : 'bg-white/[0.03]'}`}>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                <span className="text-xs text-white truncate">{p.display_name}</span>
                {gameState.descriptions[p.user_id] && <span className="text-green-400 ml-auto">✓</span>}
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
            <h2 className="text-2xl font-black text-white">ناقشوا! 💬</h2>
            <Timer duration={60} size="lg" color="purple"
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'voting' }))} />
          </div>
          <div className="space-y-3 mb-5">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-4 bg-[#12121f] rounded-xl border border-white/5">
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">{p.display_name}</p>
                  <p className="text-slate-300 text-sm mt-0.5">{gameState.descriptions[p.user_id] || <span className="italic text-slate-500">لم يصف</span>}</p>
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
            <p className="text-slate-400 mb-4 text-sm text-center">صوّت على مين صورته مختلفة!</p>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
              <p className="text-green-400 text-sm">صوّتك سُجّل ✓</p>
            </div>
          )}
          <div className="grid gap-3">
            {players.filter(p => p.user_id !== currentUserId).map(p => (
              <button key={p.id} onClick={() => handleVote(p.user_id)} disabled={!!myVote}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  myVote === p.user_id ? 'border-pink-500 bg-pink-500/15'
                    : myVote ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-pink-500/40'}`}>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="md" />
                <div className="flex-1 text-right">
                  <p className="font-semibold text-white">{p.display_name}</p>
                  {gameState.descriptions[p.user_id] && (
                    <p className="text-xs text-slate-400">{gameState.descriptions[p.user_id]}</p>
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
            <p className="text-slate-400 mb-3">صاحب الصورة المختلفة:</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar color={outsiderP?.avatar_color || '#ec4899'} emoji={outsiderP?.avatar_emoji || '🖼️'} size="xl" />
              <span className="text-2xl font-bold text-white">{outsiderP?.display_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-500/10 rounded-xl p-3 text-center">
                <div className="text-3xl mb-2">{currentPair.common.emoji}</div>
                <p className="text-xs text-slate-400">صورة المجموعة</p>
                <p className="text-sm text-white mt-1">{currentPair.common.desc}</p>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-3 text-center">
                <div className="text-3xl mb-2">{currentPair.outsider.emoji}</div>
                <p className="text-xs text-slate-400">صورة الغريب</p>
                <p className="text-sm text-cyan-300 mt-1">{currentPair.outsider.desc}</p>
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
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-white mb-6">انتهت اللعبة!</h2>
          <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 mb-5">
            <Crown size={32} className="text-amber-400 mx-auto mb-3" />
            <Avatar color={sorted[0].avatar_color} emoji={sorted[0].avatar_emoji} size="2xl" className="mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white">{sorted[0].display_name}</h3>
            <p className="text-amber-400">{gameState.scores[sorted[0].user_id] || 0} نقطة</p>
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
