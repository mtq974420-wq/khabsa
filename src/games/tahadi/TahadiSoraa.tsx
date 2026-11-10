import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Room, RoomPlayer, GameSession } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { TimerBar } from '@/components/ui/Timer'
import { Badge } from '@/components/ui/Badge'
import { Crown, Zap, CheckCircle, XCircle } from 'lucide-react'
import { shuffleArray } from '@/lib/utils'

interface Props {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

const QUESTIONS = [
  { q: 'ما هي عاصمة المملكة العربية السعودية؟', options: ['الرياض', 'جدة', 'مكة', 'المدينة'], correct: 'الرياض' },
  { q: 'كم عدد أيام الأسبوع؟', options: ['5', '6', '7', '8'], correct: '7' },
  { q: 'ما هو أكبر محيط في العالم؟', options: ['الأطلسي', 'الهادئ', 'الهندي', 'المتجمد الشمالي'], correct: 'الهادئ' },
  { q: 'ما هي أطول سلسلة جبال في العالم؟', options: ['الألب', 'الهيمالايا', 'الأنديز', 'روكي'], correct: 'الأنديز' },
  { q: 'من كتب روميو وجولييت؟', options: ['شكسبير', 'ديكنز', 'تولستوي', 'هوميروس'], correct: 'شكسبير' },
  { q: 'كم لون في قوس قزح؟', options: ['5', '6', '7', '8'], correct: '7' },
  { q: 'ما هو أسرع حيوان بري؟', options: ['الأسد', 'الفهد', 'الغزال', 'النمر'], correct: 'الفهد' },
  { q: 'كم كيلومتر تساوي الميل الواحد تقريباً؟', options: ['1', '1.6', '2', '0.8'], correct: '1.6' },
  { q: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['زحل', 'المشتري', 'أورانوس', 'نبتون'], correct: 'المشتري' },
  { q: 'ما هي أصغر دولة في العالم؟', options: ['موناكو', 'سان مارينو', 'الفاتيكان', 'ليختنشتاين'], correct: 'الفاتيكان' },
  { q: 'كم عدد حواس الإنسان الأساسية؟', options: ['4', '5', '6', '7'], correct: '5' },
  { q: 'ما هو عنصر الذهب في الجدول الدوري؟', options: ['Au', 'Go', 'Gd', 'Gl'], correct: 'Au' },
  { q: 'ما هي أطول نهر في العالم؟', options: ['الأمازون', 'النيل', 'المسيسيبي', 'الغانج'], correct: 'النيل' },
  { q: 'من هو مخترع الهاتف؟', options: ['أديسون', 'غراهام بيل', 'نيوتن', 'تسلا'], correct: 'غراهام بيل' },
  { q: 'ما عدد لاعبي كرة القدم في الفريق الواحد؟', options: ['9', '10', '11', '12'], correct: '11' },
  { q: 'ما هو أقرب كوكب للشمس؟', options: ['الزهرة', 'عطارد', 'المريخ', 'الأرض'], correct: 'عطارد' },
  { q: 'كم بوصة في القدم الواحدة؟', options: ['10', '12', '14', '16'], correct: '12' },
  { q: 'ما هو عدد القارات في العالم؟', options: ['5', '6', '7', '8'], correct: '7' },
  { q: 'ما هي لغة البرمجة المستخدمة في الويب؟', options: ['Python', 'Java', 'JavaScript', 'C++'], correct: 'JavaScript' },
  { q: 'من هو أول رائد فضاء يصل للقمر؟', options: ['يوري غاغارين', 'نيل أرمسترونغ', 'بزّ ألدرين', 'جون غلين'], correct: 'نيل أرمسترونغ' },
]

const QUESTION_TIME = 15

type Phase = 'countdown' | 'question' | 'reveal' | 'leaderboard' | 'game_end'

interface PlayerAnswer {
  answer: string
  timeMs: number
  isCorrect: boolean
  points: number
}

interface GameState {
  phase: Phase
  questionIndex: number
  questions: typeof QUESTIONS
  answers: Record<string, PlayerAnswer>
  scores: Record<string, number>
  startTime: number
  countdown: number
}

export const TahadiSoraa: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.user_id] = 0 })
    return {
      phase: 'countdown',
      questionIndex: 0,
      questions: shuffleArray([...QUESTIONS]).slice(0, room.settings.rounds || 10),
      answers: {},
      scores,
      startTime: Date.now(),
      countdown: 3,
    }
  })

  const [myAnswer, setMyAnswer] = useState<string | null>(null)
  const [timerKey, setTimerKey] = useState(0)

  const currentQuestion = gameState.questions[gameState.questionIndex]

  // Countdown effect
  useEffect(() => {
    if (gameState.phase === 'countdown') {
      const interval = setInterval(() => {
        setGameState(prev => {
          if (prev.countdown <= 1) {
            clearInterval(interval)
            return { ...prev, phase: 'question', startTime: Date.now(), countdown: 0 }
          }
          return { ...prev, countdown: prev.countdown - 1 }
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState.phase])

  const handleAnswer = (option: string) => {
    if (myAnswer || gameState.phase !== 'question') return

    const timeMs = Date.now() - gameState.startTime
    const isCorrect = option === currentQuestion.correct
    const timeBonus = isCorrect ? Math.max(0, Math.floor((QUESTION_TIME * 1000 - timeMs) / 100)) : 0
    const points = isCorrect ? 100 + timeBonus : 0

    setMyAnswer(option)
    setGameState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentUserId]: { answer: option, timeMs, isCorrect, points }
      },
      scores: {
        ...prev.scores,
        [currentUserId]: (prev.scores[currentUserId] || 0) + points
      }
    }))
  }

  const handleTimeUp = () => {
    setGameState(prev => ({ ...prev, phase: 'reveal' }))
  }

  const nextQuestion = () => {
    const nextIndex = gameState.questionIndex + 1
    if (nextIndex >= gameState.questions.length) {
      setGameState(prev => ({ ...prev, phase: 'game_end' }))
      return
    }
    setMyAnswer(null)
    setTimerKey(prev => prev + 1)
    setGameState(prev => ({
      ...prev,
      phase: 'question',
      questionIndex: nextIndex,
      answers: {},
      startTime: Date.now(),
    }))
  }

  if (gameState.phase === 'countdown') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          key={gameState.countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-center"
        >
          <div className="text-9xl font-black text-white mb-4" style={{
            textShadow: '0 0 60px rgba(16,185,129,0.8)',
          }}>
            {gameState.countdown}
          </div>
          <p className="text-slate-400">استعد! ⚡</p>
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'question' || gameState.phase === 'reveal') {
    const answered = Object.keys(gameState.answers).length

    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">
              سؤال {gameState.questionIndex + 1} / {gameState.questions.length}
            </span>
            {gameState.phase === 'question' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{answered}/{players.length} أجابوا</span>
              </div>
            )}
          </div>

          {/* Timer bar */}
          {gameState.phase === 'question' && (
            <TimerBar
              key={timerKey}
              duration={QUESTION_TIME}
              onComplete={handleTimeUp}
              color="#10b981"
              className="mb-5"
            />
          )}

          {/* Question */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-6 mb-5 text-center"
          >
            <Zap size={28} className="text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white leading-relaxed">{currentQuestion.q}</h2>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {currentQuestion.options.map((option, i) => {
              const isSelected = myAnswer === option
              const isCorrect = option === currentQuestion.correct
              const myAnswerObj = gameState.answers[currentUserId]

              let bgClass = 'bg-white/[0.03] border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5'
              
              if (gameState.phase === 'reveal') {
                if (isCorrect) bgClass = 'bg-green-500/20 border-green-500/50'
                else if (isSelected && !isCorrect) bgClass = 'bg-red-500/20 border-red-500/50'
                else bgClass = 'opacity-40 bg-white/[0.02] border-white/5'
              } else if (isSelected) {
                bgClass = 'bg-emerald-500/20 border-emerald-500/50'
              }

              const colors = ['🟦', '🟥', '🟨', '🟩']

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!myAnswer || gameState.phase === 'reveal'}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-right ${bgClass}`}
                >
                  <span className="text-lg">{colors[i]}</span>
                  <span className="text-white font-medium flex-1">{option}</span>
                  {gameState.phase === 'reveal' && isCorrect && (
                    <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                  )}
                  {gameState.phase === 'reveal' && isSelected && !isCorrect && (
                    <XCircle size={18} className="text-red-400 flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* My result */}
          {myAnswer && (
            <div className={`p-3 rounded-xl mb-4 text-center ${
              gameState.answers[currentUserId]?.isCorrect
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {gameState.answers[currentUserId]?.isCorrect ? (
                <p className="text-green-400 font-bold">
                  ✅ صح! +{gameState.answers[currentUserId]?.points} نقطة
                  {gameState.answers[currentUserId]?.points > 100 && (
                    <span className="text-amber-400"> (سرعة +{gameState.answers[currentUserId]?.points - 100})</span>
                  )}
                </p>
              ) : (
                <p className="text-red-400 font-bold">❌ غلط!</p>
              )}
            </div>
          )}

          {/* Live scoreboard during reveal */}
          {gameState.phase === 'reveal' && (
            <div className="bg-[#12121f] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">ترتيب الآن:</h3>
              {[...players]
                .sort((a, b) => (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0))
                .slice(0, 5)
                .map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-2 py-1.5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                    <span className="text-sm text-slate-500 w-5">{i + 1}</span>
                    <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                    <span className="flex-1 text-sm text-white truncate">{p.display_name}</span>
                    <span className="text-emerald-400 font-bold text-sm">{gameState.scores[p.user_id] || 0}</span>
                    {gameState.answers[p.user_id]?.isCorrect && (
                      <span className="text-xs text-green-400">+{gameState.answers[p.user_id]?.points}</span>
                    )}
                  </div>
                ))}
            </div>
          )}

          {isHost && gameState.phase === 'reveal' && (
            <Button fullWidth variant="electric" size="lg" className="mt-4" onClick={nextQuestion}>
              {gameState.questionIndex + 1 >= gameState.questions.length ? 'النتائج النهائية 🏆' : 'السؤال التالي ➡️'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'game_end') {
    const sorted = [...players].sort((a, b) => (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0))
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">⚡</div>
          <h2 className="text-4xl font-black text-white mb-6">انتهت اللعبة!</h2>
          <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-6 mb-5">
            <Crown size={32} className="text-emerald-400 mx-auto mb-3" />
            <Avatar color={sorted[0].avatar_color} emoji={sorted[0].avatar_emoji} size="2xl" className="mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white">{sorted[0].display_name}</h3>
            <p className="text-emerald-400 text-xl font-bold">{gameState.scores[sorted[0].user_id] || 0} نقطة</p>
          </div>
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-5">
            {sorted.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                <span className="flex-1 text-sm text-white">{p.display_name}</span>
                <span className="text-emerald-400 font-bold">{gameState.scores[p.user_id] || 0}</span>
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
