import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Room, RoomPlayer, GameSession } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { TimerBar } from '@/components/ui/Timer'
import { Badge } from '@/components/ui/Badge'
import { Crown, Eraser, Trash2, Pen } from 'lucide-react'
import { shuffleArray } from '@/lib/utils'

interface Props {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

const DRAW_WORDS = [
  'قطة', 'سيارة', 'بيت', 'شمس', 'قمر', 'نجمة', 'شجرة', 'سمكة', 'طائر', 'كلب',
  'تفاحة', 'موزة', 'بيضة', 'قلب', 'نظارة', 'ساعة', 'هاتف', 'كتاب', 'كوب', 'مفتاح',
  'برج', 'جبل', 'بحر', 'نهر', 'زهرة', 'خبز', 'كيكة', 'بيتزا', 'قهوة', 'شاي',
  'طيارة', 'قطار', 'باص', 'دراجة', 'قارب', 'صاروخ', 'مظلة', 'شمعة', 'مقص', 'قلم',
]

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

type Phase = 'setup' | 'drawing' | 'reveal' | 'game_end'

interface Point { x: number; y: number }

interface GameState {
  phase: Phase
  round: number
  drawerIndex: number
  currentWord: string
  scores: Record<string, number>
  guessedUsers: Array<{ userId: string; points: number }>
  usedWords: string[]
}

export const IrsomWKhamen: React.FC<Props> = ({
  room, players, gameSession, currentUserId, isHost, onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const word = DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)]
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.user_id] = 0 })
    return {
      phase: 'setup',
      round: 1,
      drawerIndex: 0,
      currentWord: word,
      scores,
      guessedUsers: [],
      usedWords: [word],
    }
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [guess, setGuess] = useState('')
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const lastPos = useRef<Point | null>(null)

  const currentDrawer = players[gameState.drawerIndex % players.length]
  const isDrawer = currentDrawer?.user_id === currentUserId

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const draw = (from: Point, to: Point) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = isEraser ? '#1a1a2e' : color
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawer) return
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const pos = getCanvasPos(e, canvas)
    lastPos.current = pos
    
    // Draw dot
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, (isEraser ? brushSize * 1.5 : brushSize / 2), 0, Math.PI * 2)
      ctx.fillStyle = isEraser ? '#1a1a2e' : color
      ctx.fill()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !isDrawer) return
    const canvas = canvasRef.current
    if (!canvas || !lastPos.current) return
    const pos = getCanvasPos(e, canvas)
    draw(lastPos.current, pos)
    lastPos.current = pos
  }

  const handleMouseUp = () => setIsDrawing(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawer) return
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const pos = getCanvasPos(e, canvas)
    lastPos.current = pos
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !isDrawer) return
    const canvas = canvasRef.current
    if (!canvas || !lastPos.current) return
    const pos = getCanvasPos(e, canvas)
    draw(lastPos.current, pos)
    lastPos.current = pos
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  useEffect(() => {
    if (gameState.phase === 'drawing') {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#1a1a2e'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [gameState.phase, gameState.round])

  const handleGuess = () => {
    if (!guess.trim() || isDrawer) return
    const isCorrect = guess.trim() === gameState.currentWord

    if (isCorrect) {
      const alreadyGuessed = gameState.guessedUsers.find(g => g.userId === currentUserId)
      if (!alreadyGuessed) {
        const timeBonus = Math.max(0, 50 - gameState.guessedUsers.length * 10)
        const points = 100 + timeBonus
        setGameState(prev => ({
          ...prev,
          guessedUsers: [...prev.guessedUsers, { userId: currentUserId, points }],
          scores: {
            ...prev.scores,
            [currentUserId]: (prev.scores[currentUserId] || 0) + points,
            [currentDrawer.user_id]: (prev.scores[currentDrawer.user_id] || 0) + 25,
          }
        }))
        setGuessResult('correct')
        setTimeout(() => setGuessResult(null), 2000)
      }
    } else {
      setGuessResult('wrong')
      setTimeout(() => setGuessResult(null), 1000)
    }
    setGuess('')
  }

  const handleTimeUp = () => {
    setGameState(prev => ({ ...prev, phase: 'reveal' }))
  }

  const nextRound = () => {
    if (gameState.round >= room.settings.rounds) {
      setGameState(prev => ({ ...prev, phase: 'game_end' }))
      return
    }
    const available = DRAW_WORDS.filter(w => !gameState.usedWords.includes(w))
    const newWord = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)]

    const nextIndex = (gameState.drawerIndex + 1) % players.length
    setGameState(prev => ({
      ...prev,
      phase: 'drawing',
      round: prev.round + 1,
      drawerIndex: nextIndex,
      currentWord: newWord,
      guessedUsers: [],
      usedWords: [...prev.usedWords, newWord],
    }))
    setTimerKey(prev => prev + 1)
    clearCanvas()
  }

  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-3xl font-black text-white mb-2">ارسم وخمّن</h2>
          <p className="text-slate-400 mb-6">ارسم الكلمة - لا تكتبها ولا تقولها!</p>

          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-6">
            <p className="text-sm text-slate-400 mb-3">ترتيب الرسم:</p>
            {players.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-2 py-1.5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span className="text-sm text-slate-500">{i + 1}.</span>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                <span className="text-sm text-white">{p.display_name}</span>
                {i === 0 && <Badge variant="purple" size="sm">أول رسام</Badge>}
              </div>
            ))}
          </div>

          {isHost && (
            <Button fullWidth size="lg" variant="primary"
              onClick={() => setGameState(prev => ({ ...prev, phase: 'drawing' }))}>
              ابدأ الرسم! 🖌️
            </Button>
          )}
        </motion.div>
      </div>
    )
  }

  if (gameState.phase === 'drawing') {
    const hintWord = gameState.currentWord.split('').map((c, i) => i === 0 ? c : '_').join(' ')

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <Avatar color={currentDrawer?.avatar_color || '#7c3aed'} emoji={currentDrawer?.avatar_emoji || '🎨'} size="sm" />
            <span className="text-sm text-white font-medium">{currentDrawer?.display_name}</span>
            {isDrawer && <Badge variant="purple" size="sm">أنت الرسام</Badge>}
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">الجولة {gameState.round}/{room.settings.rounds}</p>
            <div className="flex gap-0.5 mt-0.5">
              {gameState.guessedUsers.length > 0 && (
                <span className="text-xs text-green-400">✓ {gameState.guessedUsers.length} خمّنوا</span>
              )}
            </div>
          </div>
        </div>

        {/* Word hint */}
        <div className={`text-center py-2 mb-2 rounded-xl ${isDrawer ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-[#12121f]'}`}>
          {isDrawer ? (
            <p className="font-black text-2xl text-white">{gameState.currentWord}</p>
          ) : (
            <div>
              <p className="font-mono text-xl text-white tracking-wider">{hintWord}</p>
              <p className="text-xs text-slate-400 mt-0.5">{gameState.currentWord.length} حروف</p>
            </div>
          )}
        </div>

        {/* Timer */}
        <TimerBar key={timerKey} duration={90} onComplete={handleTimeUp} color="#8b5cf6" className="mb-2" />

        {/* Canvas */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2">
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className={`w-full h-full rounded-2xl border border-purple-500/20 touch-none ${isDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
              style={{ background: '#1a1a2e', maxHeight: '45vh' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            />
          </div>

          {/* Drawing tools / Guess panel */}
          <div className="flex flex-col gap-2 lg:w-48">
            {isDrawer ? (
              <div className="bg-[#12121f] rounded-2xl p-3 space-y-3">
                {/* Colors */}
                <div>
                  <p className="text-xs text-slate-400 mb-2">الألوان</p>
                  <div className="grid grid-cols-6 gap-1">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setIsEraser(false) }}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                          color === c && !isEraser ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Brush size */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">الحجم: {brushSize}</p>
                  <input type="range" min={2} max={20} value={brushSize}
                    onChange={e => setBrushSize(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1" />
                </div>

                {/* Tools */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEraser(!isEraser)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      isEraser ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <Eraser size={14} />
                    محو
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={14} />
                    مسح
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121f] rounded-2xl p-3 space-y-3">
                <p className="text-sm font-semibold text-white">خمّن الكلمة!</p>
                
                {/* Guessed users */}
                <div className="space-y-1">
                  {gameState.guessedUsers.map(g => {
                    const p = players.find(pl => pl.user_id === g.userId)
                    return p ? (
                      <div key={g.userId} className="flex items-center gap-1 text-xs text-green-400">
                        <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="xs" />
                        <span className="truncate">{p.display_name} ✓</span>
                      </div>
                    ) : null
                  })}
                </div>

                {/* Guess input */}
                {!gameState.guessedUsers.find(g => g.userId === currentUserId) ? (
                  <div>
                    <input
                      value={guess}
                      onChange={e => setGuess(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGuess()}
                      placeholder="اكتب وخمّن..."
                      maxLength={20}
                      className={`w-full bg-white/5 border rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ${
                        guessResult === 'wrong' ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-purple-500/50'
                      }`}
                    />
                    <Button fullWidth variant="primary" size="sm" className="mt-2" onClick={handleGuess}>
                      إرسال
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-green-400 font-bold text-sm">✅ خمّنتها!</p>
                    <p className="text-xs text-slate-400">انتظر الجولة القادمة</p>
                  </div>
                )}

                {guessResult === 'correct' && (
                  <div className="text-center text-2xl animate-bounce-in">🎉</div>
                )}
              </div>
            )}

            {isHost && (
              <Button variant="ghost" size="sm" onClick={handleTimeUp} className="text-xs">
                انتهاء الوقت
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (gameState.phase === 'reveal') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg w-full">
          <div className="text-7xl mb-4">🎨</div>
          <h2 className="text-2xl font-black text-white mb-2">الكلمة كانت:</h2>
          <div className="text-5xl font-black text-purple-300 mb-6 py-3 px-6 bg-purple-500/15 border border-purple-500/30 rounded-2xl inline-block">
            {gameState.currentWord}
          </div>

          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">النتائج:</h3>
            {[...players]
              .sort((a, b) => (gameState.scores[b.user_id] || 0) - (gameState.scores[a.user_id] || 0))
              .map((p, i) => {
                const guessed = gameState.guessedUsers.find(g => g.userId === p.user_id)
                return (
                  <div key={p.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                    <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                    <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                    <span className="flex-1 text-sm text-white">{p.display_name}</span>
                    {guessed && <span className="text-xs text-green-400">✓ خمّن</span>}
                    {currentDrawer?.user_id === p.user_id && <span className="text-xs text-purple-400">🎨 رسام</span>}
                    <span className="text-amber-400 font-bold text-sm">{gameState.scores[p.user_id] || 0}</span>
                  </div>
                )
              })}
          </div>

          {isHost && (
            <div className="flex gap-3">
              <Button fullWidth variant="primary" size="lg" onClick={nextRound}>
                {gameState.round >= room.settings.rounds ? 'النتائج النهائية 🏆' : 'الجولة القادمة ➡️'}
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
          <div className="bg-gradient-to-br from-violet-500/15 to-violet-600/5 border border-violet-500/30 rounded-2xl p-6 mb-5">
            <Crown size={32} className="text-violet-400 mx-auto mb-3" />
            <Avatar color={sorted[0].avatar_color} emoji={sorted[0].avatar_emoji} size="2xl" className="mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white">{sorted[0].display_name}</h3>
            <p className="text-violet-400 text-xl font-bold">{gameState.scores[sorted[0].user_id] || 0} نقطة</p>
          </div>
          <div className="bg-[#12121f] border border-purple-500/20 rounded-2xl p-4 mb-5">
            {sorted.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" />
                <span className="flex-1 text-sm text-white">{p.display_name}</span>
                <span className="text-violet-400 font-bold">{gameState.scores[p.user_id] || 0}</span>
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
