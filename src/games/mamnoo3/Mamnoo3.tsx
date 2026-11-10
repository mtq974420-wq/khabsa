import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Room, RoomPlayer, GameSession } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Timer } from '@/components/ui/Timer'
import { Badge } from '@/components/ui/Badge'
import { Crown, XCircle, CheckCircle, SkipForward } from 'lucide-react'
import { shuffleArray } from '@/lib/utils'

interface Props {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

const WORD_CARDS = [
  { word: 'سيارة', forbidden: ['مركبة', 'تقود', 'عجلات', 'بنزين', 'شارع'] },
  { word: 'تلفاز', forbidden: ['شاشة', 'برامج', 'قناة', 'ريموت', 'فلم'] },
  { word: 'هاتف', forbidden: ['اتصال', 'رسالة', 'شاشة', 'بطارية', 'واتساب'] },
  { word: 'مطبخ', forbidden: ['طبخ', 'أكل', 'موقد', 'طعام', 'وصفة'] },
  { word: 'مدرسة', forbidden: ['تعليم', 'طالب', 'معلم', 'صف', 'واجب'] },
  { word: 'طائرة', forbidden: ['سفر', 'طيار', 'مطار', 'تحلق', 'جناح'] },
  { word: 'كمبيوتر', forbidden: ['لابتوب', 'تقنية', 'برنامج', 'إنترنت', 'شاشة'] },
  { word: 'نظارة', forbidden: ['رؤية', 'عيون', 'عدسة', 'إطار', 'بصر'] },
  { word: 'ساعة', forbidden: ['وقت', 'عقارب', 'دقيقة', 'ساعة', 'مؤقت'] },
  { word: 'كتاب', forbidden: ['قراءة', 'صفحة', 'روائي', 'قصة', 'كاتب'] },
  { word: 'مستشفى', forbidden: ['طبيب', 'مرض', 'علاج', 'ممرض', 'دواء'] },
  { word: 'جامعة', forbidden: ['تعليم', 'طالب', 'شهادة', 'دراسة', 'أستاذ'] },
  { word: 'ملعب', forbidden: ['كرة', 'رياضة', 'فريق', 'جمهور', 'مباراة'] },
  { word: 'بحر', forbidden: ['ماء', 'سباحة', 'سمك', 'موج', 'شاطئ'] },
  { word: 'جبل', forbidden: ['ارتفاع', 'صخور', 'تسلق', 'برد', 'ثلج'] },
  { word: 'مطعم', forbidden: ['أكل', 'طعام', 'قائمة', 'طاولة', 'نادل'] },
  { word: 'سينما', forbidden: ['فلم', 'شاشة', 'ممثل', 'تذكرة', 'مقعد'] },
  { word: 'ملابس', forbidden: ['قميص', 'بناطيل', 'لبس', 'قماش', 'موضة'] },
  { word: 'موبايل', forbidden: ['هاتف', 'تطبيق', 'شحن', 'سلفي', 'سوشيال'] },
  { word: 'نوم', forbidden: ['سرير', 'تعب', 'حلم', 'ليل', 'فراش'] },
]

type Phase = 'setup' | 'explaining' | 'round_end' | 'game_end'

interface GameState {
  teams: { a: string[]; b: string[] }
  currentTeam: 'a' | 'b'
  currentExplainerId: string
  phase: Phase
  round: number
  teamScores: { a: number; b: number }
  currentRoundGuessed: number
  skipsUsed: number
  currentWordIndex: number
  shuffledWords: typeof WORD_CARDS
  timerKey: number
}

const ROUND_TIME = 60
const MAX_SKIPS = 3

export const Mamnoo3: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const half = Math.floor(players.length / 2)
    const shuffledPlayers = shuffleArray([...players])
    const teamA = shuffledPlayers.slice(0, half).map(p => p.user_id)
    const teamB = shuffledPlayers.slice(half).map(p => p.user_id)

    return {
      teams: { a: teamA, b: teamB },
      currentTeam: 'a',
      currentExplainerId: teamA[0],
      phase: 'setup',
      round: 1,
      teamScores: { a: 0, b: 0 },
      currentRoundGuessed: 0,
      skipsUsed: 0,
      currentWordIndex: 0,
      shuffledWords: shuffleArray([...WORD_CARDS]),
      timerKey: 0,
    }
  })

  const [guessInput, setGuessInput] = useState('')
  const [lastResult, setLastResult] = useState<'correct' | 'skip' | null>(null)
  const isExplainer = gameState.currentExplainerId === currentUserId
  const currentWord = gameState.shuffledWords[gameState.currentWordIndex]
  const myTeam = gameState.teams.a.includes(currentUserId) ? 'a' : 'b'

  const handleCorrect = () => {
    if (!isExplainer) return
    setLastResult('correct')
    setGameState(prev => ({
      ...prev,
      currentRoundGuessed: prev.currentRoundGuessed + 1,
      currentWordIndex: (prev.currentWordIndex + 1) % prev.shuffledWords.length,
    }))
    setTimeout(() => setLastResult(null), 500)
  }

  const handleSkip = () => {
    if (!isExplainer || gameState.skipsUsed >= MAX_SKIPS) return
    setLastResult('skip')
    setGameState(prev => ({
      ...prev,
      skipsUsed: prev.skipsUsed + 1,
      currentWordIndex: (prev.currentWordIndex + 1) % prev.shuffledWords.length,
    }))
    setTimeout(() => setLastResult(null), 500)
  }

  const handleTimeUp = () => {
    const team = gameState.currentTeam
    const newScores = { ...gameState.teamScores }
    newScores[team] = newScores[team] + (gameState.currentRoundGuessed * 50)

    // Switch teams
    const nextTeam = team === 'a' ? 'b' : 'a'
    const nextExplainer = gameState.teams[nextTeam][gameState.round % gameState.teams[nextTeam].length]

    setGameState(prev => ({
      ...prev,
      currentTeam: nextTeam,
      currentExplainerId: nextExplainer,
      teamScores: newScores,
      phase: 'round_end',
      currentRoundGuessed: 0,
      skipsUsed: 0,
    }))
  }

  const startNextTurn = () => {
    if (gameState.round >= room.settings.rounds * 2) {
      setGameState(prev => ({ ...prev, phase: 'game_end' }))
      return
    }

    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      phase: 'explaining',
      currentRoundGuessed: 0,
      skipsUsed: 0,
      timerKey: prev.timerKey + 1,
    }))
  }

  const getTeamPlayers = (team: 'a' | 'b') =>
    players.filter(p => gameState.teams[team].includes(p.user_id))

  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-3xl font-black text-white mb-2">ممنوع تحكي!</h2>
          <p className="text-slate-400 mb-6">فسّر الكلمة لفريقك بدون ما تقول الكلمات الممنوعة</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
              <div className="font-bold text-purple-300 mb-2">فريق أ 🟣</div>
              {getTeamPlayers('a').map(p => (
                <div key={p.id} className="flex items-center gap-2 mt-2">
                  <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                  <span className="text-sm text-white truncate">{p.display_name}</span>
                </div>
              ))}
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
              <div className="font-bold text-cyan-300 mb-2">فريق ب 🔵</div>
              {getTeamPlayers('b').map(p => (
                <div key={p.id} className="flex items-center gap-2 mt-2">
                  <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                  <span className="text-sm text-white truncate">{p.display_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#12121f] border border-white/10 rounded-xl p-4 mb-6 text-sm text-slate-400 text-right">
            <p className="font-semibold text-white mb-2">القواعد:</p>
            <ul className="space-y-1">
              <li>• المفسِّر يرى الكلمة والكلمات الممنوعة</li>
              <li>• فريقه يخمّن الكلمة من التفسير</li>
              <li>• {MAX_SKIPS} تخطيات مسموح في كل دور</li>
              <li>• كل كلمة صحيحة = 50 نقطة للفريق</li>
            </ul>
          </div>

          {isHost && (
            <Button fullWidth size="lg" variant="primary"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'explaining' }))}>
              ابدأ! فريق أ أول 🎮
            </Button>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'explaining') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 pt-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <Badge variant={gameState.currentTeam === 'a' ? 'purple' : 'electric'} size="md">
                {gameState.currentTeam === 'a' ? 'فريق أ 🟣' : 'فريق ب 🔵'}
              </Badge>
              <p className="text-xs text-slate-400 mt-1">
                {players.find(p => p.user_id === gameState.currentExplainerId)?.display_name} يفسّر
              </p>
            </div>
            <Timer
              key={gameState.timerKey}
              duration={ROUND_TIME}
              size="lg"
              color={gameState.currentTeam === 'a' ? 'purple' : 'electric'}
              onComplete={handleTimeUp}
            />
          </div>

          {/* Score bar */}
          <div className="flex items-center gap-3 mb-5 p-3 bg-[#12121f] rounded-xl">
            <div className="text-center flex-1">
              <div className="text-xl font-black text-purple-400">{gameState.teamScores.a}</div>
              <div className="text-xs text-slate-400">فريق أ</div>
            </div>
            <div className="text-slate-500 text-sm">VS</div>
            <div className="text-center flex-1">
              <div className="text-xl font-black text-cyan-400">{gameState.teamScores.b}</div>
              <div className="text-xs text-slate-400">فريق ب</div>
            </div>
            <div className="border-r border-white/10 mx-2 h-8" />
            <div className="text-center">
              <div className="text-xl font-black text-green-400">{gameState.currentRoundGuessed}</div>
              <div className="text-xs text-slate-400">هذه الجولة</div>
            </div>
          </div>

          {isExplainer ? (
            /* Explainer view */
            <div>
              <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-6 mb-5">
                <p className="text-xs text-slate-400 mb-2 text-center">الكلمة السرية</p>
                <div className="text-4xl font-black text-white text-center mb-4">{currentWord?.word}</div>
                <div className="border-t border-red-500/20 pt-3">
                  <p className="text-xs text-red-400 mb-2 text-center">🚫 الممنوع قوله:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentWord?.forbidden.map(w => (
                      <span key={w} className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className={`fixed top-1/3 left-1/2 -translate-x-1/2 text-6xl pointer-events-none z-50`}
                  >
                    {lastResult === 'correct' ? '✅' : '⏭️'}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSkip}
                  disabled={gameState.skipsUsed >= MAX_SKIPS}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 font-bold disabled:opacity-30 hover:bg-yellow-500/20 transition-all active:scale-95"
                >
                  <SkipForward size={20} />
                  تخطي ({MAX_SKIPS - gameState.skipsUsed})
                </button>
                <button
                  onClick={handleCorrect}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 font-bold hover:bg-green-500/20 transition-all active:scale-95"
                >
                  <CheckCircle size={20} />
                  خمّنوها! ✓
                </button>
              </div>
            </div>
          ) : (
            /* Guesser view */
            <div>
              <div className={`p-5 rounded-2xl mb-5 ${
                myTeam === gameState.currentTeam
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-slate-800/50 border border-white/10'
              }`}>
                {myTeam === gameState.currentTeam ? (
                  <div className="text-center">
                    <div className="text-5xl mb-3">🎯</div>
                    <p className="text-green-300 font-bold text-lg">خمّن الكلمة!</p>
                    <p className="text-slate-400 text-sm mt-1">استمع لزميلك واصيح الإجابة</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-5xl mb-3">👀</div>
                    <p className="text-slate-300 font-bold">تفرّج على الفريق الآخر</p>
                    <p className="text-slate-500 text-sm mt-1">دورك قريب!</p>
                  </div>
                )}
              </div>

              <div className="bg-[#12121f] rounded-2xl p-4">
                <p className="text-sm text-slate-400 mb-3">لاعبون في الدور:</p>
                {getTeamPlayers(gameState.currentTeam).map(p => (
                  <div key={p.id} className="flex items-center gap-2 py-1.5">
                    <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm"
                      isSpeaking={p.user_id === gameState.currentExplainerId} />
                    <span className="text-sm text-white">{p.display_name}</span>
                    {p.user_id === gameState.currentExplainerId && (
                      <Badge variant="purple" size="sm">يفسّر</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-slate-400">
                <span className="text-green-400 font-bold">{gameState.currentRoundGuessed}</span> كلمة صحيحة حتى الآن
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'round_end') {
    const prevTeam = gameState.currentTeam === 'a' ? 'b' : 'a'
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg w-full">
          <div className="text-6xl mb-4">⏱️</div>
          <h2 className="text-2xl font-black text-white mb-4">انتهى دور {prevTeam === 'a' ? 'فريق أ' : 'فريق ب'}!</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-5 rounded-2xl border ${gameState.currentTeam === 'a' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="text-3xl font-black text-purple-400 mb-1">{gameState.teamScores.a}</div>
              <div className="text-sm text-slate-400">فريق أ 🟣</div>
            </div>
            <div className={`p-5 rounded-2xl border ${gameState.currentTeam === 'b' ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="text-3xl font-black text-cyan-400 mb-1">{gameState.teamScores.b}</div>
              <div className="text-sm text-slate-400">فريق ب 🔵</div>
            </div>
          </div>

          <p className="text-slate-400 mb-5">
            الدور القادم: {gameState.currentTeam === 'a' ? 'فريق أ 🟣' : 'فريق ب 🔵'}
          </p>

          {isHost && (
            <div className="flex gap-3">
              <Button fullWidth variant="primary" size="lg" onClick={startNextTurn}>
                {gameState.round >= room.settings.rounds * 2 ? 'النتائج النهائية 🏆' : 'ابدأ الدور القادم ➡️'}
              </Button>
              <Button variant="ghost" size="lg" onClick={onBackToLobby}>الغرفة</Button>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'game_end') {
    const winnerTeam = gameState.teamScores.a > gameState.teamScores.b ? 'a' : 'b'
    const isTie = gameState.teamScores.a === gameState.teamScores.b
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-white mb-6">
            {isTie ? 'تعادل! 🤝' : `فاز ${winnerTeam === 'a' ? 'فريق أ 🟣' : 'فريق ب 🔵'}!`}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className={`p-5 rounded-2xl border ${winnerTeam === 'a' && !isTie ? 'border-amber-500 bg-amber-500/15' : 'border-purple-500/30 bg-purple-500/10'}`}>
              {winnerTeam === 'a' && !isTie && <Crown size={24} className="text-amber-400 mx-auto mb-2" />}
              <div className="text-3xl font-black text-purple-400">{gameState.teamScores.a}</div>
              <div className="text-sm text-slate-400 mt-1">فريق أ 🟣</div>
              {getTeamPlayers('a').map(p => (
                <div key={p.id} className="flex items-center gap-1 mt-2 justify-center">
                  <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                  <span className="text-xs text-slate-300 truncate">{p.display_name}</span>
                </div>
              ))}
            </div>
            <div className={`p-5 rounded-2xl border ${winnerTeam === 'b' && !isTie ? 'border-amber-500 bg-amber-500/15' : 'border-cyan-500/30 bg-cyan-500/10'}`}>
              {winnerTeam === 'b' && !isTie && <Crown size={24} className="text-amber-400 mx-auto mb-2" />}
              <div className="text-3xl font-black text-cyan-400">{gameState.teamScores.b}</div>
              <div className="text-sm text-slate-400 mt-1">فريق ب 🔵</div>
              {getTeamPlayers('b').map(p => (
                <div key={p.id} className="flex items-center gap-1 mt-2 justify-center">
                  <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                  <span className="text-xs text-slate-300 truncate">{p.display_name}</span>
                </div>
              ))}
            </div>
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
