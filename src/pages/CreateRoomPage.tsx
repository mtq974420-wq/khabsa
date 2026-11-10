import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useRoomStore } from '@/stores/roomStore'
import { GAME_INFO } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GameType } from '@/types'
import toast from 'react-hot-toast'
import { Users, Lock, Unlock, Settings2, Play, ArrowRight } from 'lucide-react'

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { createRoom } = useRoomStore()

  const preselectedGame = (location.state?.gameType as GameType) || null

  const [roomName, setRoomName] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [selectedGame, setSelectedGame] = useState<GameType | null>(preselectedGame)
  const [rounds, setRounds] = useState(5)
  const [isCreating, setIsCreating] = useState(false)

  const games = Object.values(GAME_INFO)

  const handleCreate = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    setIsCreating(true)
    try {
      const room = await createRoom(
        user.id,
        user.display_name,
        user.avatar_color,
        user.avatar_emoji,
        {
          name: roomName || `غرفة ${user.display_name}`,
          is_private: isPrivate,
          max_players: maxPlayers,
          game_type: selectedGame,
          settings: {
            rounds,
            round_duration: 60,
            voting_duration: 30,
            allow_spectators: true,
            auto_start: false,
          },
        }
      )
      toast.success(`الغرفة جاهزة! كود: ${room.code} 🎉`)
      navigate(`/room/${room.code}`)
    } catch (err: any) {
      toast.error(err.message || 'تعذر إنشاء الغرفة')
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowRight size={16} />
          رجوع
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-white mb-2">إنشاء غرفة جديدة</h1>
          <p className="text-slate-400 mb-8">خصّص غرفتك وادعو أصحابك</p>

          {/* Room Settings Card */}
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 mb-5">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Settings2 size={20} className="text-purple-400" />
              إعدادات الغرفة
            </h2>

            <div className="space-y-5">
              {/* Room Name */}
              <Input
                label="اسم الغرفة (اختياري)"
                placeholder={`غرفة ${user?.display_name || 'الحفلة'}`}
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                maxLength={30}
              />

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">الخصوصية</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isPrivate
                        ? 'bg-purple-500/15 border-purple-500/50 text-white'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Lock size={16} className={isPrivate ? 'text-purple-400' : ''} />
                    <div className="text-right">
                      <div className="text-sm font-semibold">خاصة</div>
                      <div className="text-xs opacity-60">بكود دعوة فقط</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      !isPrivate
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Unlock size={16} className={!isPrivate ? 'text-cyan-400' : ''} />
                    <div className="text-right">
                      <div className="text-sm font-semibold">عامة</div>
                      <div className="text-xs opacity-60">يمكن للجميع الانضمام</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Users size={14} className="inline ml-1" />
                  عدد اللاعبين الأقصى: <span className="text-purple-400 font-bold">{maxPlayers}</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>2</span>
                  <span>12</span>
                </div>
              </div>

              {/* Rounds */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  عدد الجولات: <span className="text-purple-400 font-bold">{rounds}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={rounds}
                  onChange={e => setRounds(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Selection */}
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              🎮 اختر اللعبة (اختياري)
            </h2>
            <p className="text-slate-400 text-sm mb-4">يمكنك اختيار اللعبة الآن أو من داخل الغرفة</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                    selectedGame === game.id
                      ? 'border-opacity-50 text-white'
                      : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                  style={{
                    borderColor: selectedGame === game.id ? game.color : undefined,
                    background: selectedGame === game.id ? `${game.color}10` : undefined,
                  }}
                >
                  <span className="text-xl flex-shrink-0">{game.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{game.name}</div>
                    <div className="text-xs opacity-60">
                      {game.minPlayers}-{game.maxPlayers} لاعبين
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            fullWidth
            size="xl"
            variant="primary"
            onClick={handleCreate}
            isLoading={isCreating}
            leftIcon={<Play size={20} />}
            className="shadow-2xl shadow-purple-500/30"
          >
            إنشاء الغرفة
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
