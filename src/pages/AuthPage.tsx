import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export const AuthPage: React.FC = () => {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'login' | 'register'>(
    params.get('tab') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { loginWithEmail, registerWithEmail, loginAsGuest } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email) errs.email = 'الإيميل مطلوب'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'إيميل غير صحيح'
    if (!password) errs.password = 'كلمة المرور مطلوبة'
    else if (password.length < 6) errs.password = 'كلمة المرور قصيرة جداً'
    if (tab === 'register' && !username) errs.username = 'الاسم مطلوب'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsLoading(true)
    
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password)
        toast.success('أهلاً وسهلاً! 🎉')
      } else {
        await registerWithEmail(email, password, username)
        toast.success('تم التسجيل بنجاح! 🎊')
      }
      navigate('/games')
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestPlay = async () => {
    setIsLoading(true)
    await loginAsGuest()
    toast.success('مرحباً بك كضيف! 👋')
    navigate('/games')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 pt-20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-cyan-600/10 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-block">
            <h1 className="text-5xl font-black"
              style={{
                background: 'linear-gradient(135deg, #fff, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              خَبْصَة
            </h1>
          </button>
          <p className="text-slate-400 text-sm mt-2">منصة الألعاب الاجتماعية العربية</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-black/30 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'login'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              دخول
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'register'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {tab === 'register' && (
                <Input
                  label="الاسم"
                  placeholder="اسمك في اللعبة"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  error={errors.username}
                  maxLength={20}
                />
              )}
              
              <Input
                label="الإيميل"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                dir="ltr"
              />
              
              <Input
                label="كلمة المرور"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                dir="ltr"
              />

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                {tab === 'login' ? 'دخول' : 'إنشاء حساب'}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-slate-500 text-xs">أو</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Guest play */}
          <Button
            fullWidth
            variant="ghost"
            size="lg"
            onClick={handleGuestPlay}
            isLoading={isLoading}
            className="border border-white/10"
          >
            🎭 العب كضيف بدون تسجيل
          </Button>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← العودة للرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  )
}
