import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, ScoreBadge } from '@/components/ui/Badge'
import { AVATAR_COLORS, AVATAR_EMOJIS } from '@/lib/constants'
import { calculateWinRate, pointsToLevel } from '@/lib/utils'
import { Edit2, Trophy, Gamepad2, Star, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const ACHIEVEMENTS = [
  { key: 'first_game', name: 'أول خبصة', icon: '🎮', desc: 'العب لعبتك الأولى', earned: true },
  { key: 'win_10', name: 'بطل', icon: '🏆', desc: 'افوز بـ 10 ألعاب', earned: true },
  { key: 'outsider', name: 'الغريب المحترف', icon: '🕵️', desc: 'انجُ كغريب 5 مرات', earned: false },
  { key: 'drawer', name: 'فنان', icon: '🎨', desc: 'ارسم 20 كلمة بنجاح', earned: false },
  { key: 'speed', name: 'برق', icon: '⚡', desc: 'أجب أول سؤال في أقل من 3 ثوان', earned: true },
  { key: 'social', name: 'نجم الحفلة', icon: '🌟', desc: 'العب مع 10 أشخاص مختلفين', earned: false },
]

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuthStore()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || '#7c3aed')
  const [selectedEmoji, setSelectedEmoji] = useState(user?.avatar_emoji || '🎮')
  const [isSaving, setIsSaving] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-white mb-4">سجّل دخول لرؤية ملفك</h2>
          <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>تسجيل الدخول</Button>
        </div>
      </div>
    )
  }

  const { level, title, nextLevelPoints } = pointsToLevel(user.total_points)
  const winRate = calculateWinRate(user.total_wins, user.total_games)

  const handleSave = async () => {
    setIsSaving(true)
    await updateProfile({
      display_name: displayName,
      avatar_color: selectedColor,
      avatar_emoji: selectedEmoji,
    })
    setIsSaving(false)
    setEditing(false)
    toast.success('تم حفظ التعديلات! ✅')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 mb-5 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-40 h-20 bg-purple-600/20 rounded-full blur-2xl" />
            
            <div className="relative flex items-start gap-5">
              <div className="relative">
                <Avatar
                  color={editing ? selectedColor : user.avatar_color}
                  emoji={editing ? selectedEmoji : user.avatar_emoji}
                  size="2xl"
                />
                {editing && (
                  <button
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
                    onClick={() => {}}
                  >
                    <Edit2 size={16} className="text-white" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="text-xl font-black mb-2"
                    maxLength={20}
                  />
                ) : (
                  <h1 className="text-2xl font-black text-white mb-1">{user.display_name}</h1>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="purple" size="sm">المستوى {level} - {title}</Badge>
                  {user.is_guest && <Badge variant="ghost" size="sm">ضيف</Badge>}
                  <ScoreBadge score={user.total_points} />
                </div>
                
                {/* Level progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>تقدم المستوى</span>
                    <span>{user.total_points}/{nextLevelPoints}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (user.total_points / nextLevelPoints) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <Button size="sm" variant="primary" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={14} />}>
                    حفظ
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)} leftIcon={<Edit2 size={14} />}>
                    تعديل
                  </Button>
                )}
              </div>
            </div>

            {/* Avatar editor */}
            {editing && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">اختر لون الأفاتار</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          selectedColor === c ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">اختر إيموجي</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setSelectedEmoji(e)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                          selectedEmoji === e ? 'bg-purple-500/30 border border-purple-500' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'إجمالي الألعاب', value: user.total_games, icon: <Gamepad2 size={18} />, color: '#7c3aed' },
              { label: 'مرات الفوز', value: user.total_wins, icon: <Trophy size={18} />, color: '#f59e0b' },
              { label: 'نسبة الفوز', value: `${winRate}%`, icon: <Star size={18} />, color: '#10b981' },
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5 mb-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-400" />
              الإنجازات
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map(achievement => (
                <div
                  key={achievement.key}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    achievement.earned
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-bold text-white">{achievement.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{achievement.desc}</div>
                  {achievement.earned && (
                    <Badge variant="gold" size="sm" className="mt-2">مكتسب ✓</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button fullWidth variant="primary" size="lg" onClick={() => navigate('/games')} leftIcon={<Gamepad2 size={18} />}>
            العب الآن
          </Button>
          <Button variant="danger" size="lg" onClick={async () => { await logout(); navigate('/') }}>
            خروج
          </Button>
        </div>
      </div>
    </div>
  )
}
