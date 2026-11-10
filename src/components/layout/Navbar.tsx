import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Menu, X, Trophy, Settings, LogOut, User, ChevronDown } from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-lg font-bold shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
              خ
            </div>
            <span className="text-xl font-black text-white">
              خَبْصَة
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/games" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              الألعاب
            </Link>
            <Link to="/leaderboard" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              المتصدرين
            </Link>
            <Link to="/join" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              انضم لغرفة
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Avatar
                    color={user.avatar_color}
                    emoji={user.avatar_emoji}
                    size="sm"
                  />
                  <span className="hidden md:block text-sm font-medium text-white max-w-24 truncate">
                    {user.display_name}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-[#12121f] border border-purple-500/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-purple-500/10">
                      <p className="text-sm font-bold text-white truncate">{user.display_name}</p>
                      <p className="text-xs text-slate-400">{user.is_guest ? 'ضيف' : `${user.total_points} نقطة`}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors">
                        <User size={14} />
                        الملف الشخصي
                      </button>
                      <button onClick={() => { navigate('/leaderboard'); setProfileOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors">
                        <Trophy size={14} />
                        المتصدرون
                      </button>
                      <button onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors">
                        <Settings size={14} />
                        الإعدادات
                      </button>
                      <div className="border-t border-purple-500/10 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm transition-colors">
                          <LogOut size={14} />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  دخول
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth?tab=register')}>
                  تسجيل
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-purple-500/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            <Link to="/games" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm">
              الألعاب
            </Link>
            <Link to="/leaderboard" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm">
              المتصدرين
            </Link>
            <Link to="/join" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm">
              انضم لغرفة
            </Link>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  )
}
