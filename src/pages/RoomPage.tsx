import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useRoomStore } from '@/stores/roomStore'
import { GAME_INFO } from '@/lib/constants'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { VoiceChat } from '@/components/voice/VoiceChat'
import { GameSelector } from '@/components/room/GameSelector'
import { GameContainer } from '@/games/GameContainer'
import { copyToClipboard } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Copy, Share2, LogOut, Crown, CheckCircle2, Circle,
  Users, Gamepad2, Settings, MessageSquare, Mic
} from 'lucide-react'

export const RoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user, loginAsGuest } = useAuthStore()
  const { room, players, gameSession, joinRoom, leaveRoom, setReady, startGame, subscribeToRoom } = useRoomStore()

  const [activeTab, setActiveTab] = useState<'players' | 'chat' | 'voice'>('players')
  const [isJoining, setIsJoining] = useState(false)
  const [showGameSelector, setShowGameSelector] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [needsAuth, setNeedsAuth] = useState(false)

  const currentPlayer = players.find(p => p.user_id === user?.id)
  const isHost = currentPlayer?.is_host || false
  const allReady = players.length > 1 && players.filter(p => !p.is_host).every(p => p.is_ready)
  const gameInfo = room?.game_type ? GAME_INFO[room.game_type] : null

  const doJoin = useCallback(async (playerUser: typeof user) => {
    if (!playerUser || !code) return
    setIsJoining(true)
    try {
      await joinRoom(code, playerUser.id, playerUser.display_name, playerUser.avatar_color, playerUser.avatar_emoji)
    } catch (err: any) {
      toast.error(err.message)
      navigate('/')
    } finally {
      setIsJoining(false)
    }
  }, [code, joinRoom, navigate])

  useEffect(() => {
    if (!user) {
      setNeedsAuth(true)
      return
    }
    if (!room) {
      doJoin(user)
    }
  }, [user])

  useEffect(() => {
    if (room) {
      const unsub = subscribeToRoom(room.id)
      return unsub
    }
  }, [room?.id])

  const handleGuestJoin = async () => {
    setIsJoining(true)
    await loginAsGuest(guestName || undefined)
    setNeedsAuth(false)
  }

  const handleLeave = async () => {
    await leaveRoom()
    navigate('/')
    toast.success('غادرت الغرفة')
  }

  const handleCopyCode = () => {
    if (!room) return
    copyToClipboard(room.code)
    toast.success('تم نسخ الكود! 📋')
  }

  const handleShareLink = () => {
    if (!room) return
    const url = `${window.location.origin}/room/${room.code}`
    copyToClipboard(url)
    toast.success('تم نسخ رابط الدعوة! 🔗')
  }

  const handleStartGame = async () => {
    if (!room?.game_type) {
      setShowGameSelector(true)
      return
    }
    await startGame(room.game_type)
    toast.success('بدأت اللعبة! 🎮')
  }

  const handleSelectGame = async (gameType: string) => {
    setShowGameSelector(false)
    await startGame(gameType)
    toast.success('بدأت اللعبة! 🎮')
  }

  // Show auth prompt
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-2xl font-black text-white mb-2">الغرفة: {code}</h2>
          <p className="text-slate-400 mb-6">ادخل اسمك وانضم للغرفة</p>
          <input
            className="input-field mb-4 text-center"
            placeholder="اسمك (اختياري)"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGuestJoin()}
            maxLength={20}
          />
          <Button fullWidth size="lg" onClick={handleGuestJoin} isLoading={isJoining} className="mb-3">
            انضم كضيف
          </Button>
          <button onClick={() => navigate('/auth')} className="text-sm text-purple-400 hover:text-purple-300">
            أو سجّل دخول بحساب
          </button>
        </div>
      </div>
    )
  }

  if (isJoining && !room) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">جاري الانضمام...</p>
        </div>
      </div>
    )
  }

  if (!room) return null

  // Show game if in progress
  if (room.status === 'in_game' && gameSession) {
    return (
      <GameContainer
        room={room}
        players={players}
        gameSession={gameSession}
        currentUserId={user?.id || ''}
        isHost={isHost}
        onBackToLobby={() => useRoomStore.getState().updateGameSession({ status: 'finished' })}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-16 flex flex-col">
      {/* Room Header */}
      <div className="bg-[#0f0f1a]/90 backdrop-blur-xl border-b border-purple-500/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
              🎮
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">{room.name}</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-mono tracking-widest"
                >
                  {room.code}
                  <Copy size={10} />
                </button>
                <Badge variant="ghost" size="sm">
                  <Users size={10} />
                  {players.length}/{room.max_players}
                </Badge>
                {gameInfo && (
                  <Badge variant="purple" size="sm">
                    {gameInfo.emoji} {gameInfo.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShareLink} leftIcon={<Share2 size={14} />}>
              دعوة
            </Button>
            <Button variant="danger" size="sm" onClick={handleLeave} leftIcon={<LogOut size={14} />}>
              خروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-5 h-full">
          
          {/* Left: Players + Game Select */}
          <div className="lg:col-span-2 space-y-5">
            {/* Players Grid */}
            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  اللاعبون ({players.length}/{room.max_players})
                </h2>
                {allReady && isHost && (
                  <Badge variant="success" pulse>كل الكل جاهز!</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {players.map(player => (
                    <motion.div
                      key={player.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        player.user_id === user?.id
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-white/5 bg-white/[0.02]'
                      }`}
                    >
                      <Avatar
                        color={player.avatar_color}
                        emoji={player.avatar_emoji}
                        size="lg"
                        isHost={player.is_host}
                      />
                      <span className="text-xs font-medium text-white text-center truncate w-full max-w-full">
                        {player.display_name}
                        {player.user_id === user?.id && ' (أنت)'}
                      </span>
                      <div className="flex items-center gap-1">
                        {player.is_host ? (
                          <Badge variant="gold" size="sm"><Crown size={9} /> هوست</Badge>
                        ) : player.is_ready ? (
                          <Badge variant="success" size="sm"><CheckCircle2 size={9} /> جاهز</Badge>
                        ) : (
                          <Badge variant="ghost" size="sm"><Circle size={9} /> ينتظر</Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, Math.min(4, room.max_players - players.length)) }).map((_, i) => (
                  <div key={`empty-${i}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-dashed border-white/10 opacity-30">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">+</div>
                    <span className="text-xs text-slate-500">فارغ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Selection */}
            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Gamepad2 size={18} className="text-purple-400" />
                  اللعبة المختارة
                </h2>
                {isHost && (
                  <Button variant="ghost" size="sm" onClick={() => setShowGameSelector(true)}>
                    تغيير
                  </Button>
                )}
              </div>

              {gameInfo ? (
                <div className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{ borderColor: `${gameInfo.color}30`, background: `${gameInfo.color}08` }}>
                  <div className="text-4xl">{gameInfo.emoji}</div>
                  <div>
                    <h3 className="font-bold text-white">{gameInfo.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{gameInfo.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span><Users size={11} className="inline" /> {gameInfo.minPlayers}-{gameInfo.maxPlayers}</span>
                      <span>⏱️ {gameInfo.avgDuration}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border border-dashed border-purple-500/20 cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                  onClick={() => isHost && setShowGameSelector(true)}
                >
                  <div className="text-4xl opacity-50">🎮</div>
                  <p className="text-slate-400 text-sm">
                    {isHost ? 'اختر لعبة للبدء' : 'الهوست لم يختر لعبة بعد'}
                  </p>
                  {isHost && (
                    <Button variant="primary" size="sm">اختر لعبة</Button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isHost ? (
                <Button
                  fullWidth
                  size="xl"
                  variant="primary"
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                  className="shadow-2xl shadow-purple-500/30"
                  leftIcon={<Gamepad2 size={20} />}
                >
                  {players.length < 2 ? 'تحتاج لاعبَين على الأقل' : 'ابدأ اللعبة!'}
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="xl"
                  variant={currentPlayer?.is_ready ? 'danger' : 'primary'}
                  onClick={() => setReady(user?.id || '', !currentPlayer?.is_ready)}
                  leftIcon={currentPlayer?.is_ready ? <Circle size={20} /> : <CheckCircle2 size={20} />}
                >
                  {currentPlayer?.is_ready ? 'ما أنا جاهز' : 'أنا جاهز!'}
                </Button>
              )}
            </div>
          </div>

          {/* Right: Chat/Voice Panel */}
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-purple-500/10">
              {[
                { id: 'players' as const, icon: <Users size={14} />, label: 'اللاعبون' },
                { id: 'chat' as const, icon: <MessageSquare size={14} />, label: 'دردشة' },
                { id: 'voice' as const, icon: <Mic size={14} />, label: 'صوت' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all ${
                    activeTab === t.id
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && (
                <ChatPanel
                  roomId={room.id}
                  userId={user?.id || ''}
                  displayName={user?.display_name || ''}
                  avatarColor={user?.avatar_color || '#7c3aed'}
                  avatarEmoji={user?.avatar_emoji || '🎮'}
                />
              )}
              {activeTab === 'voice' && (
                <VoiceChat
                  roomId={room.id}
                  userId={user?.id || ''}
                  displayName={user?.display_name || ''}
                  players={players}
                />
              )}
              {activeTab === 'players' && (
                <div className="p-3 space-y-2 overflow-y-auto h-full">
                  {players.map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                      <Avatar color={p.avatar_color} emoji={p.avatar_emoji} size="sm" isHost={p.is_host} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{p.display_name}</p>
                        <p className="text-xs text-slate-500">⭐ {p.score} نقطة</p>
                      </div>
                      {p.is_ready && !p.is_host && (
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Selector Modal */}
      <AnimatePresence>
        {showGameSelector && (
          <GameSelector
            onSelect={handleSelectGame}
            onClose={() => setShowGameSelector(false)}
            playerCount={players.length}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
