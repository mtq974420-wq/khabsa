import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import { Navbar } from '@/components/layout/Navbar'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'
import { HomePage } from '@/pages/HomePage'
import { AuthPage } from '@/pages/AuthPage'
import { GamesPage } from '@/pages/GamesPage'
import { CreateRoomPage } from '@/pages/CreateRoomPage'
import { RoomPage } from '@/pages/RoomPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { AdminPage } from '@/pages/AdminPage'
import { useAuthStore } from '@/stores/authStore'

// Pages that don't show the navbar
const NO_NAVBAR_PAGES = ['/room/']

const AppContent: React.FC = () => {
  const location = useLocation()
  const { loadUser } = useAuthStore()

  const showNavbar = !NO_NAVBAR_PAGES.some(path => location.pathname.startsWith(path))

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {showNavbar && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:gameId" element={<GamesPage />} />
          <Route path="/create-room" element={<CreateRoomPage />} />
          <Route path="/room/:code" element={<RoomPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>

      <ConnectionStatus />
      <Toaster        position="top-center"
        toastOptions={{
          style: {
            background: '#12121f',
            color: '#f8fafc',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '0.75rem',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  )
}

// Simple Join page
const JoinPage: React.FC = () => {
  const [code, setCode] = React.useState('')
  const navigate = React.useCallback((to: string) => window.location.href = to, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🎮</div>
        <h2 className="text-2xl font-black text-white mb-2">انضم لغرفة</h2>
        <p className="text-slate-400 mb-6">ادخل كود الغرفة للانضمام</p>
        <input
          className="input-field text-center text-2xl font-mono tracking-widest uppercase mb-4"
          placeholder="XXXXXX"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          onKeyDown={e => e.key === 'Enter' && code.length === 6 && (window.location.href = `/room/${code}`)}
        />
        <button
          className="btn-primary w-full text-lg"
          disabled={code.length < 6}
          onClick={() => window.location.href = `/room/${code}`}
        >
          انضم للغرفة
        </button>
      </div>
    </div>
  )
}

// Settings page
const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuthStore()

  if (!user) return <Navigate to="/auth" />

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">الإعدادات</h1>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">إعدادات الصوت</h2>
            <div className="space-y-3">
              {[
                { label: 'صوت التنبيهات', defaultChecked: true },
                { label: 'صوت اللعبة', defaultChecked: true },
                { label: 'صوت الدردشة', defaultChecked: false },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-white text-sm">{setting.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={setting.defaultChecked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#12121f] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">إعدادات العرض</h2>
            <div className="space-y-3">
              {[
                { label: 'الوضع المظلم', defaultChecked: true },
                { label: 'تأثيرات الحركة', defaultChecked: true },
                { label: 'إشعارات الغرفة', defaultChecked: true },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-white text-sm">{setting.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={setting.defaultChecked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
