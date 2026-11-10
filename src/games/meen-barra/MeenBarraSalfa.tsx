import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Room, RoomPlayer, GameSession } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Timer, TimerBar } from '@/components/ui/Timer'
import { Badge } from '@/components/ui/Badge'
import { SECRET_WORDS } from './data'
import { shuffleArray, pickRandom, generateId } from '@/lib/utils'
import { useRoomStore } from '@/stores/roomStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, MessageCircle, ThumbsUp, Crown, Skull } from 'lucide-react'

interface Props {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

type Phase = 'reveal_role' | 'discussion' | 'voting' | 'reveal' | 'round_end' | 'game_end'

interface GameState {
  secretWord: string
  outsiderId: string
  phase: Phase
  round: number
  votes: Record<string, string>
  scores: Record<string, number>
  timeLeft: number
  revealedWord?: string
}

const DISCUSSION_TIME = 90
const VOTING_TIME = 45

export const MeenBarraSalfa: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const { updateGameSession } = useRoomStore()
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const wordData = pickRandom(SECRET_WORDS)
    const outsider = players[Math.floor(Math.random() * players.length)]
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.user_id] = 0 })
    
    return {
      secretWord: wordData.word,
      outsiderId: outsider.user_id,
      phase: 'reveal_role',
      round: 1,
      votes: {},
      scores,
      timeLeft: DISCUSSION_TIME,
    }
  })
  
  const [myVote, setMyVote] = useState<string | null>(null)
  const [showWord, setShowWord] = useState(false)
  const [roleRevealed, setRoleRevealed] = useState(false)
  const [winnerMessage, setWinnerMessage] = useState('')

  const isOutsider = gameState.outsiderId === currentUserId
  const myPlayer = players.find(p => p.user_id === currentUserId)

  const startNextRound = useCallback(() => {
    if (gameState.round >= room.settings.rounds) {
      setGameState(prev => ({ ...prev, phase: 'game_end' }))
      return
    }
    
    const wordData = pickRandom(SECRET_WORDS)
    const outsider = players[Math.floor(Math.random() * players.length)]
    
    setGameState(prev => ({
      ...prev,
      secretWord: wordData.word,
      outsiderId: outsider.user_id,
      phase: 'reveal_role',
      round: prev.round + 1,
      votes: {},
      timeLeft: DISCUSSION_TIME,
    }))
    setMyVote(null)
    setShowWord(false)
    setRoleRevealed(false)
  }, [gameState.round, players, room.settings.rounds])

  const handleVote = (targetId: string) => {
    if (gameState.phase !== 'voting' || myVote) return
    setMyVote(targetId)
    setGameState(prev => ({
      ...prev,
      votes: { ...prev.votes, [currentUserId]: targetId }
    }))
    toast.success('تم تسجيل صوتك! 🗳️')
  }

  const handleEndVoting = () => {
    // Count votes
    const voteCounts: Record<string, number> = {}
    Object.values(gameState.votes).forEach(v => {
      voteCounts[v] = (voteCounts[v] || 0) + 1
    })
    
    // Find most voted
    let mostVoted = ''
    let maxVotes = 0
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        mostVoted = id
      }
    })
    
    const outsiderCaught = mostVoted === gameState.outsiderId
    const outsiderPlayer = players.find(p => p.user_id === gameState.outsiderId)
    
    // Calculate scores
    const newScores = { ...gameState.scores }
    
    if (outsiderCaught) {
      // Players who caught outsider get points
      players.forEach(p => {
        if (p.user_id !== gameState.outsiderId && gameState.votes[p.user_id] === gameState.outsiderId) {
          newScores[p.user_id] = (newScores[p.user_id] || 0) + 100
        }
      })
      setWinnerMessage(`تم كشف ${outsiderPlayer?.display_name}! 🎉 المجموعة فازت!`)
    } else {
      // Outsider survives
      newScores[gameState.outsiderId] = (newScores[gameState.outsiderId] || 0) + 150
      setWinnerMessage(`${outsiderPlayer?.display_name} نجا! 😈 الغريب فاز!`)
    }
    
    setGameState(prev => ({
      ...prev,
      phase: 'reveal',
      scores: newScores,
      revealedWord: prev.secretWord,
    }))
  }

  const getTopScorer = () => {
    let top = { id: '', score: 0, name: '' }
    Object.entries(gameState.scores).forEach(([id, score]) => {
      if (score > top.score) {
        const p = players.find(p => p.user_id === id)
        top = { id, score, name: p?.display_name || '' }
      }
    })
    return top
  }

  if (gameState.phase === 'reveal_role') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="text-6xl mb-6 animate-bounce">🕵️</div>
          <h2 className="text-3xl font-black text-white mb-2">الجولة {gameState.round}</h2>
          <p className="text-slate-400 mb-8">تعرّف على دورك - لا تكشف للثانيين!</p>
          
          {!roleRevealed ? (
            <button
              onClick={() => setRoleRevealed(true)}
              className="w-full py-6 rounded-2xl border-2 border-dashed border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
            >
              <div className="text-4xl mb-3">👁️</div>
              <p className="text-purple-300 text-lg font-semibold">اضغط لرؤية دورك</p>
              <p className="text-slate-500 text-sm mt-1">تأكد أن أحد ما يشوف شاشتك</p>
            </button>
          ) : (
            <motion.div
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              className={`w-full p-8 rounded-2xl ${isOutsider ? 'bg-red-500/15 border-2 border-red-500/50' : 'bg-purple-500/15 border-2 border-purple-500/50'}`}
            >
              {isOutsider ? (
                <>
                  <div className="text-6xl mb-4">🎭</div>
                  <h3 className="text-2xl font-black text-red-400 mb-2">أنت الغريب!</h3>
                  <p className="text-slate-300">ما تعرف الكلمة السرية</p>
                  <p className="text-slate-400 text-sm mt-2">حاول تخمّن الكلمة وما تنكشف!</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🤫</div>
                  <h3 className="text-2xl font-black text-purple-300 mb-2">الكلمة السرية:</h3>
                  <div className="text-4xl font-black text-white my-3 py-3 px-6 bg-purple-600/30 rounded-xl">
                    {gameState.secretWord}
                  </div>
                  <p className="text-slate-400 text-sm">لا تقل الكلمة مباشرة!</p>
                </>
              )}
            </motion.div>
          )}
          
          {roleRevealed && (
            <Button
              fullWidth
              size="lg"
              variant="primary"
              className="mt-6"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'discussion' }))}
            >
              جاهز! ابدأ النقاش 🎙️
            </Button>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'discussion') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">وقت النقاش</h2>
              <p className="text-slate-400 text-sm">الجولة {gameState.round} من {room.settings.rounds}</p>
            </div>
            <Timer
              duration={DISCUSSION_TIME}
              size="lg"
              color="purple"
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'voting' }))}
            />
          </div>

          {/* My role reminder */}
          <div className={`p-4 rounded-xl mb-6 ${isOutsider ? 'bg-red-500/10 border border-red-500/30' : 'bg-purple-500/10 border border-purple-500/30'}`}>
            {isOutsider ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎭</span>
                <div>
                  <p className="font-bold text-red-400">أنت الغريب 🕵️</p>
                  <p className="text-sm text-slate-400">حاول تخمّن الكلمة من النقاش</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤫</span>
                  <div>
                    <p className="font-bold text-purple-300">الكلمة السرية:</p>
                    <button
                      onClick={() => setShowWord(!showWord)}
                      className="flex items-center gap-1 text-sm text-slate-400"
                    >
                      {showWord ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showWord ? gameState.secretWord : '••••••'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <MessageCircle size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">قواعد النقاش:</h3>
                <ul className="text-slate-400 text-sm space-y-2">
                  <li>• كل شخص يوصف الكلمة السرية بكلمة أو جملة قصيرة</li>
                  <li>• لا تقل الكلمة السرية مباشرة!</li>
                  <li>• الغريب يحاول يخمّن الكلمة من إجابات الثانيين</li>
                  <li>• الكل يحاول يكشف مين الغريب من إجاباته</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-2 p-3 bg-[#12121f] rounded-xl border border-purple-500/10">
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" isHost={p.is_host} />
                <span className="text-sm text-white truncate">{p.display_name}</span>
              </div>
            ))}
          </div>

          {isHost && (
            <Button
              fullWidth
              variant="primary"
              size="lg"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'voting' }))}
            >
              انتقل للتصويت ⚡
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'voting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">وقت التصويت 🗳️</h2>
              <p className="text-slate-400 text-sm">صوّت مين برّا السالفة!</p>
            </div>
            <Timer
              duration={VOTING_TIME}
              size="lg"
              color="electric"
              onComplete={handleEndVoting}
            />
          </div>

          {myVote ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-5 text-center">
              <CheckMark />
              <p className="text-green-400 font-semibold mt-2">صوّتك على {players.find(p => p.user_id === myVote)?.display_name}</p>
              <p className="text-slate-400 text-sm">ينتظر بقية الأصوات...</p>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5 text-center">
              <p className="text-amber-400 text-sm">صوّت على مين تعتقد إنه الغريب!</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players
              .filter(p => p.user_id !== currentUserId)
              .map(p => {
                const voted = myVote === p.user_id
                const votesForThis = Object.values(gameState.votes).filter(v => v === p.user_id).length
                return (
                  <button
                    key={p.id}
                    onClick={() => handleVote(p.user_id)}
                    disabled={!!myVote}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      voted
                        ? 'border-purple-500 bg-purple-500/15 scale-[1.02]'
                        : myVote
                          ? 'border-white/5 opacity-50 cursor-not-allowed'
                          : 'border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer'
                    }`}
                  >
                    <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="md" isHost={p.is_host} />
                    <div className="flex-1 text-right">
                      <p className="font-semibold text-white">{p.display_name}</p>
                      {votesForThis > 0 && (
                        <p className="text-xs text-slate-400">{votesForThis} صوت</p>
                      )}
                    </div>
                    {voted && <ThumbsUp size={18} className="text-purple-400 flex-shrink-0" />}
                  </button>
                )
              })}
          </div>

          {isHost && (
            <Button
              fullWidth
              variant="electric"
              size="lg"
              className="mt-6"
              onClick={handleEndVoting}
            >
              كشف النتيجة!
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'reveal') {
    const outsiderPlayer = players.find(p => p.user_id === gameState.outsiderId)
    const wasOutsiderCaught = (() => {
      const voteCounts: Record<string, number> = {}
      Object.values(gameState.votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1 })
      let max = 0, maxId = ''
      Object.entries(voteCounts).forEach(([id, c]) => { if (c > max) { max = c; maxId = id } })
      return maxId === gameState.outsiderId
    })()

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4 animate-bounce-in">
            {wasOutsiderCaught ? '🎉' : '😈'}
          </div>
          <h2 className="text-4xl font-black text-white mb-2">{winnerMessage}</h2>
          
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-6 my-6">
            <p className="text-slate-400 mb-2">الغريب كان:</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar color={outsiderPlayer?.avatar_color || '#7c3aed'} emoji={outsiderPlayer?.avatar_emoji || '🎭'} size="xl" />
              <span className="text-2xl font-black text-white">{outsiderPlayer?.display_name}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <p className="text-slate-400">الكلمة السرية:</p>
              <span className="text-2xl font-bold text-purple-300">{gameState.secretWord}</span>
            </div>
          </div>

          {/* Scores */}
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-white mb-3">النقاط 🏆</h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0))
                .map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-5">{i + 1}</span>
                    <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                    <span className="flex-1 text-sm text-white text-right">{p.display_name}</span>
                    <span className="text-amber-400 font-bold text-sm">
                      +{gameState.scores[p.user_id] || 0}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {isHost && (
            <div className="flex gap-3">
              {gameState.round < room.settings.rounds ? (
                <Button fullWidth variant="primary" size="lg" onClick={startNextRound}>
                  الجولة التالية ➡️
                </Button>
              ) : (
                <Button fullWidth variant="gold" size="lg" onClick={() => setGameState(prev => ({ ...prev, phase: 'game_end' }))}>
                  النتائج النهائية 🏆
                </Button>
              )}
              <Button variant="ghost" size="lg" onClick={onBackToLobby}>
                الغرفة
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'game_end') {
    const top = getTopScorer()
    const winner = players.find(p => p.user_id === top.id)
    const sortedPlayers = [...players].sort((a, b) =>
      (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0)
    )

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-white mb-2">انتهت اللعبة!</h2>
          
          {winner && (
            <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 my-6">
              <Crown size={32} className="text-amber-400 mx-auto mb-3" />
              <Avatar color={winner.avatar_color} emoji={winner.avatar_emoji} size="2xl" className="mx-auto mb-3" />
              <h3 className="text-2xl font-black text-white">{winner.display_name}</h3>
              <p className="text-amber-400 text-lg font-bold">{top.score} نقطة</p>
              <Badge variant="gold" size="md" className="mt-2">🏆 الفائز!</Badge>
            </div>
          )}

          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-5 mb-6">
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span className="text-lg">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                <span className="flex-1 text-white text-right text-sm">{p.display_name}</span>
                <span className="text-amber-400 font-bold">{gameState.scores[p.user_id] || 0}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button fullWidth variant="primary" size="lg" onClick={() => window.location.reload()}>
              لعبة جديدة 🎮
            </Button>
            <Button fullWidth variant="ghost" size="lg" onClick={onBackToLobby}>
              الغرفة
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

const CheckMark = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto">
    <circle cx="20" cy="20" r="18" fill="none" stroke="#10b981" strokeWidth="2" />
    <path d="M12 20l6 6 10-12" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
