import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { GAME_INFO } from '@/lib/constants'
import {
  LayoutDashboard, Gamepad2, MessageSquare, Image, Users, Settings,
  Plus, Trash2, Edit2, Upload, Download, ChevronLeft, BarChart3,
  Eye, Shield
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type AdminSection = 'dashboard' | 'games' | 'words' | 'questions' | 'pictures' | 'users' | 'settings'

const MOCK_STATS = {
  totalUsers: 1247,
  activeRooms: 8,
  gamesPlayed: 4532,
  dailyActive: 234,
}

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [newWord, setNewWord] = useState('')
  const [newCategory, setNewCategory] = useState('')

  // Simple access check - in production this would be server-side
  if (!user || (user.role !== 'admin' && !user.username?.includes('admin'))) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-3">صفحة الإدارة</h2>
          <p className="text-slate-400 mb-5">هذه الصفحة للمديرين فقط. للتجربة، سجّل بـ admin@khabsa.com</p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/auth')}>تسجيل الدخول</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>الرئيسية</Button>
          </div>
        </div>
      </div>
    )
  }

  const navItems: Array<{ id: AdminSection; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { id: 'games', label: 'الألعاب', icon: <Gamepad2 size={18} /> },
    { id: 'words', label: 'الكلمات السرية', icon: <MessageSquare size={18} /> },
    { id: 'questions', label: 'الأسئلة', icon: <MessageSquare size={18} /> },
    { id: 'pictures', label: 'الصور', icon: <Image size={18} /> },
    { id: 'users', label: 'المستخدمين', icon: <Users size={18} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} /> },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-16 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f0f1a] border-l border-purple-500/10 flex flex-col h-screen sticky top-16 overflow-y-auto">
        <div className="p-4 border-b border-purple-500/10">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-purple-400" />
            <span className="font-bold text-white">لوحة الإدارة</span>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === item.id
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-purple-500/10">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white">
            <ChevronLeft size={16} />
            العودة للموقع
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {section === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-black text-white mb-6">لوحة التحكم</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'مجموع المستخدمين', value: MOCK_STATS.totalUsers, icon: '👥', color: '#7c3aed' },
                { label: 'غرف نشطة', value: MOCK_STATS.activeRooms, icon: '🎮', color: '#06b6d4' },
                { label: 'ألعاب ملعوبة', value: MOCK_STATS.gamesPlayed, icon: '🏆', color: '#f59e0b' },
                { label: 'نشطون اليوم', value: MOCK_STATS.dailyActive, icon: '⚡', color: '#10b981' },
              ].map((stat, i) => (
                <div key={i} className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-black text-white">{stat.value.toLocaleString()}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-purple-400" />
                  أشهر الألعاب
                </h2>
                {Object.values(GAME_INFO).slice(0, 5).map((game, i) => (
                  <div key={game.id} className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{game.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{game.name}</span>
                        <span className="text-slate-400">{Math.floor(1000 / (i + 1))} لعبة</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${90 - i * 15}%`, background: game.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
                <h2 className="font-bold text-white mb-4">آخر النشاطات</h2>
                {[
                  { text: 'مستخدم جديد سجّل', time: 'منذ دقيقتين', icon: '👤' },
                  { text: 'غرفة "حفلة الجمعة" بدأت', time: 'منذ 5 دقائق', icon: '🎮' },
                  { text: 'تم رفع 10 صور جديدة', time: 'منذ 15 دقيقة', icon: '🖼️' },
                  { text: 'تحديث أسئلة تحدي السرعة', time: 'منذ ساعة', icon: '⚡' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-xl">{activity.icon}</span>
                    <div>
                      <p className="text-sm text-white">{activity.text}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {section === 'words' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-white">الكلمات السرية</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" leftIcon={<Upload size={14} />}>استيراد</Button>
                <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>تصدير</Button>
                <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>إضافة كلمة</Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5 mb-5">
              <h2 className="font-semibold text-white mb-4">إضافة كلمة جديدة</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <Input placeholder="الكلمة" value={newWord} onChange={e => setNewWord(e.target.value)} />
                <Input placeholder="الفئة" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                <div className="flex gap-2">
                  <select className="input-field flex-1 text-sm">
                    <option>سهل</option>
                    <option>متوسط</option>
                    <option>صعب</option>
                  </select>
                  <Button variant="primary" size="sm" onClick={() => { if (newWord) { setNewWord(''); setNewCategory('') } }}>
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="p-3 text-right">الكلمة</th>
                    <th className="p-3 text-right">الفئة</th>
                    <th className="p-3 text-right">الصعوبة</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {['بيتزا', 'كرة قدم', 'مطار', 'قهوة', 'أسد'].map((word, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="p-3 text-white font-medium">{word}</td>
                      <td className="p-3 text-slate-400">طعام</td>
                      <td className="p-3"><Badge variant="success" size="sm">سهل</Badge></td>
                      <td className="p-3 text-center"><Badge variant="electric" size="sm">مفعّل</Badge></td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Edit2 size={14} /></button>
                          <button className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {section === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-white">الأسئلة</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" leftIcon={<Upload size={14} />}>استيراد</Button>
                <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>سؤال جديد</Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
              <div className="flex gap-2 mb-5">
                {Object.values(GAME_INFO).slice(0, 4).map(game => (
                  <button key={game.id} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 hover:border-purple-500/40 text-slate-400 hover:text-white transition-all">
                    {game.emoji} {game.name.split('?')[0]}
                  </button>
                ))}
              </div>
              <TextArea placeholder="السؤال..." label="نص السؤال" className="mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="الخيار الصحيح" label="الإجابة الصحيحة" />
                <Input placeholder="خيار خاطئ 1" label="خيار خاطئ" />
                <Input placeholder="خيار خاطئ 2" />
                <Input placeholder="خيار خاطئ 3" />
              </div>
              <Button variant="primary" size="md" className="mt-4" leftIcon={<Plus size={14} />}>
                إضافة السؤال
              </Button>
            </div>
          </motion.div>
        )}

        {section === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-black text-white mb-6">إدارة المستخدمين</h1>
            <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex gap-3">
                <Input placeholder="بحث عن مستخدم..." className="flex-1" />
                <Button variant="ghost" size="sm">بحث</Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="p-3 text-right">المستخدم</th>
                    <th className="p-3 text-right">النوع</th>
                    <th className="p-3 text-center">الألعاب</th>
                    <th className="p-3 text-center">النقاط</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {['أحمد', 'سارة', 'محمد', 'نور', 'عمر'].map((name, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="p-3 text-white">{name}</td>
                      <td className="p-3"><Badge variant={i === 0 ? 'gold' : 'ghost'} size="sm">{i === 0 ? 'مشرف' : 'عادي'}</Badge></td>
                      <td className="p-3 text-center text-slate-400">{50 - i * 8}</td>
                      <td className="p-3 text-center text-amber-400">{5000 - i * 800}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Eye size={14} /></button>
                          <button className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Shield size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {section === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-black text-white mb-6">إعدادات المنصة</h1>
            <div className="space-y-5">
              {[
                { title: 'إعدادات اللعبة', fields: [
                  { label: 'وقت الجولة (ثانية)', value: '60' },
                  { label: 'وقت التصويت (ثانية)', value: '30' },
                  { label: 'حد اللاعبين', value: '12' },
                ]},
                { title: 'إعدادات الغرف', fields: [
                  { label: 'مدة صلاحية الغرفة (ساعات)', value: '24' },
                  { label: 'حد الغرف المتزامنة', value: '100' },
                ]},
              ].map((section, i) => (
                <div key={i} className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
                  <h2 className="font-bold text-white mb-4">{section.title}</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {section.fields.map(field => (
                      <Input key={field.label} label={field.label} defaultValue={field.value} type="number" />
                    ))}
                  </div>
                  <Button variant="primary" size="sm" className="mt-4">حفظ التغييرات</Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {(section === 'games' || section === 'pictures') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-black text-white mb-6">
              {section === 'games' ? 'إدارة الألعاب' : 'إدارة الصور'}
            </h1>
            <div className="text-center py-16">
              <div className="text-5xl mb-4">{section === 'games' ? '🎮' : '🖼️'}</div>
              <p className="text-slate-400">هذا القسم قيد التطوير</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
