import React, { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Wifi, WifiOff } from 'lucide-react'

export const ConnectionStatus: React.FC = () => {
  const [show, setShow] = useState(false)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    // Show banner for 5 seconds on load if not configured
    if (!configured) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 8000)
      return () => clearTimeout(t)
    }
  }, [configured])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/90 backdrop-blur text-black text-sm font-semibold shadow-2xl">
        <WifiOff size={16} />
        وضع تجريبي — الغرف تعمل محلياً فقط
        <button onClick={() => setShow(false)} className="mr-2 opacity-60 hover:opacity-100">✕</button>
      </div>
    </div>
  )
}
