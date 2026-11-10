import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { GAME_INFO } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { GameType } from '@/types'
import {
  Gamepad2, Zap, Users, Mic, Trophy, Star,
  ArrowLeft, Play, Plus, LogIn, Sparkles, Shield, Globe
} from 'lucide-react'

const games = Object.values(GAME_INFO)

const FEATURES = [
  {
    icon: <Users size={24} />,
    title: 'ألعاب جماعية',
    desc: 'العب مع أصحابك من أي مكان في العالم بغرف خاصة أو عامة',
    color: '#7c3aed',
  },
  {
    icon: <Mic size={24} />,
    title: 'دردشة صوتية',
    desc: 'تكلم مع رفاقك مباشرة أثناء اللعب بجودة صوت ممتازة',
    color: '#06b6d4',
  },
  {
    icon: <Zap size={24} />,
    title: 'مباريات حية',
    desc: 'نتائج فورية وتحديثات مباشرة بدون تأخير أو انقطاع',
    color: '#f59e0b',
  },
  {
    icon: <Trophy size={24} />,
    title: 'نقاط وإنجازات',
    desc: 'اكسب نقاط وانجازات وتسلق قائمة المتصدرين',
    color: '#10b981',
  },
  {
    icon: <Shield size={24} />,
    title: 'خصوصية كاملة',
    desc: 'غرف خاصة بكود دعوة حصري - أنت من تختار من يلعب',
    color: '#ec4899',
  },
  {
    icon: <Globe size={24} />,
    title: 'عربي 100%',
    desc: 'واجهة عربية كاملة وأسئلة وكلمات بالعربي الأصيل',
    color: '#a855f7',
  },
]

const STATS = [
  { number: '7', label: 'ألعاب مختلفة', emoji: '🎮' },
  { number: '500+', label: 'سؤال وكلمة', emoji: '📝' },
  { number: '10', label: 'لاعبين في غرفة', emoji: '👥' },
  { number: '∞', label: 'متعة لا تنتهي', emoji: '🎉' },
]

export const HomePage: React.FC = () => {
  const { user, loginAsGuest } = useAuthStore()
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [hoveredGame, setHoveredGame] = useState<GameType | null>(null)
  const [guestName, setGuestName] = useState('')
  const [showGuestInput, setShowGuestInput] = useState(false)
  const [activeStatIdx, setActiveStatIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIdx(prev => (prev + 1) % STATS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return
    
    if (!user) {
      setShowGuestInput(true)
      return
    }
    
    navigate(`/room/${roomCode.toUpperCase()}`)
  }

  const handleGuestPlay = async (action: 'create' | 'join') => {
    setIsJoining(true)
    await loginAsGuest(guestName || undefined)
    setIsJoining(false)
    setShowGuestInput(false)
    
    if (action === 'create') {
      navigate('/create-room')
    } else if (roomCode) {
      navigate(`/room/${roomCode.toUpperCase()}`)
    } else {
      navigate('/games')
    }
  }

  const handleCreateRoom = () => {
    if (!user) {
      setShowGuestInput(true)
      return
    }
    navigate('/create-room')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Radial glows */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]" />
        </div>

        {/* Floating game emojis */}
        {games.slice(0, 6).map((game, i) => (
          <div
            key={game.id}
            className="absolute text-3xl opacity-10 select-none pointer-events-none"
            style={{
              top: `${15 + (i * 15)}%`,
              right: i % 2 === 0 ? `${5 + (i * 3)}%` : undefined,
              left: i % 2 !== 0 ? `${5 + (i * 2)}%` : undefined,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {game.emoji}
          </div>
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8"
          >
            <Sparkles size={14} className="text-purple-400" />
            منصة الألعاب الاجتماعية العربية الأولى
            <Sparkles size={14} className="text-purple-400" />
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-7xl md:text-9xl font-black mb-4 leading-none"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.3))',
              }}>
              خَبْصَة
            </h1>
            <p className="text-xl md:text-2xl text-purple-200/80 font-medium mb-2">
              اللعب بلّش... والخبصة علينا!
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-12"
          >
            العب مع أصحابك 7 ألعاب حفلات مجنونة - من التجسس والتحقيق وحتى الرسم والتخمين.
            بدون تحميل، بدون تسجيل إلزامي.
          </motion.p>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="xl"
              variant="primary"
              onClick={handleCreateRoom}
              leftIcon={<Plus size={20} />}
              className="text-lg px-8 py-4 shadow-2xl shadow-purple-500/30"
            >
              ابدأ غرفة الحين
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="كود الغرفة"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                  className="w-36 text-center tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              <Button
                size="xl"
                variant="electric"
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
                leftIcon={<LogIn size={18} />}
                className="whitespace-nowrap"
              >
                انضم
              </Button>
            </div>
          </motion.div>

          {/* Guest play hint */}
          {!user && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-500 text-sm"
            >
              يمكنك اللعب كضيف بدون تسجيل ·{' '}
              <button
                onClick={() => setShowGuestInput(true)}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                العب الآن
              </button>
            </motion.p>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`text-center p-4 rounded-2xl transition-all duration-500 ${
                  activeStatIdx === i
                    ? 'bg-purple-500/15 border border-purple-500/30 scale-105'
                    : 'bg-white/[0.03] border border-white/5'
                }`}
              >
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <div className="text-2xl font-black text-white">{stat.number}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-slate-500">اكتشف الألعاب</span>
          <div className="w-5 h-8 border border-slate-600 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-slate-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GAMES SECTION
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="purple" size="md" className="mb-4">🎮 الألعاب</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              7 ألعاب، لا حدود للمتعة
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              من التجسس والتحقيق وحتى الرسم والتنافس - كل لعبة تجربة مختلفة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onHoverStart={() => setHoveredGame(game.id)}
                onHoverEnd={() => setHoveredGame(null)}
                className="group relative cursor-pointer"
                onClick={() => navigate(`/games/${game.id}`)}
              >
                {/* Card */}
                <div className="relative overflow-hidden rounded-2xl border transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, #12121f, #1a1a2e)`,
                    borderColor: hoveredGame === game.id ? `${game.color}60` : 'rgba(124,58,237,0.15)',
                    boxShadow: hoveredGame === game.id ? `0 20px 40px rgba(0,0,0,0.5), 0 0 20px ${game.color}20` : 'none',
                  }}
                >
                  {/* Gradient top bar */}
                  <div
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, ${game.color}, ${game.color}60)` }}
                  />

                  {/* Content */}
                  <div className="p-5">
                    {/* Emoji */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                      style={{
                        background: `${game.color}20`,
                        border: `1px solid ${game.color}40`,
                      }}
                    >
                      {game.emoji}
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                      {game.name}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                      {game.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {game.minPlayers}-{game.maxPlayers}
                      </span>
                      <span>{game.avgDuration}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {game.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: `${game.color}15`, color: game.color }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hover play button */}
                  <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
                    hoveredGame === game.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-transform hover:scale-105"
                        style={{ background: game.color }}
                        onClick={(e) => { e.stopPropagation(); navigate('/create-room', { state: { gameType: game.id } }) }}
                      >
                        <Play size={16} fill="white" />
                        العب الآن
                      </button>
                      <button
                        className="text-slate-300 hover:text-white text-xs underline"
                        onClick={(e) => { e.stopPropagation(); navigate(`/games/${game.id}`) }}
                      >
                        اعرف أكثر
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="secondary" size="lg" onClick={() => navigate('/games')} rightIcon={<ArrowLeft size={18} />}>
              كل الألعاب
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW TO PLAY
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="electric" size="md" className="mb-4">⚡ كيف تلعب</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              3 خطوات وتلعب
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🎮',
                title: 'ابدأ أو انضم',
                desc: 'أنشئ غرفة جديدة وشارك الكود مع أصحابك، أو انضم بكود موجود',
                color: '#7c3aed',
              },
              {
                step: '02',
                icon: '👥',
                title: 'اختر اللعبة',
                desc: 'الهوست يختار اللعبة والإعدادات، الكل يضغط جاهز ونبدأ!',
                color: '#06b6d4',
              },
              {
                step: '03',
                icon: '🏆',
                title: 'العب واكسب',
                desc: 'اضحك، تنافس، واكسب نقاط - الخبصة ضمانة وسط الجماعة!',
                color: '#f59e0b',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center group"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto transition-transform group-hover:scale-110"
                    style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: step.color }}>
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="gold" size="md" className="mb-4">✨ المميزات</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              كل شي لازم تعبه
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feature.color}20`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #12121f, #1a1a2e)',
              border: '1px solid rgba(124,58,237,0.3)',
              boxShadow: '0 0 80px rgba(124,58,237,0.15)',
            }}
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-purple-600/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="text-5xl mb-6">🎉</div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                جاهز للخبصة؟
              </h2>
              <p className="text-slate-400 mb-8">
                انضم لآلاف اللاعبين اللي بيلعبوا كل يوم - بدون تحميل وبدون بيانات مطلوبة!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  variant="primary"
                  onClick={handleCreateRoom}
                  leftIcon={<Plus size={20} />}
                  className="shadow-2xl shadow-purple-500/30"
                >
                  ابدأ غرفة الحين
                </Button>
                {!user && (
                  <Button
                    size="xl"
                    variant="secondary"
                    onClick={() => navigate('/auth')}
                  >
                    سجّل حساب مجاني
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-purple-500/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-3xl font-black text-white mb-2">خَبْصَة</div>
          <p className="text-slate-500 text-sm">اللعب بلّش... والخبصة علينا! 🎮</p>
          <p className="text-slate-600 text-xs mt-4">© 2025 Khabsa. All rights reserved.</p>
        </div>
      </footer>

      {/* Guest Name Modal */}
      <AnimatePresence>
        {showGuestInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowGuestInput(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-black text-white mb-2 text-center">الل! مين انت؟ 🎭</h2>
              <p className="text-slate-400 text-center mb-6 text-sm">اختار اسم كضيف وابدأ اللعب فوراً</p>
              <Input
                placeholder="اسمك... مثلاً: نمر_خبيص"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuestPlay(roomCode ? 'join' : 'create')}
                className="mb-4"
                maxLength={20}
              />
              <div className="flex gap-3">
                <Button
                  fullWidth
                  variant="primary"
                  size="lg"
                  isLoading={isJoining}
                  onClick={() => handleGuestPlay(roomCode ? 'join' : 'create')}
                >
                  {roomCode ? 'انضم للغرفة' : 'ابدأ اللعب'}
                </Button>
              </div>
              <div className="text-center mt-4">
                <button onClick={() => navigate('/auth')} className="text-sm text-purple-400 hover:text-purple-300">
                  أو سجّل حساب دائم
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
