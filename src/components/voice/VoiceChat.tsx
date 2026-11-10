import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RoomPlayer } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { STUN_SERVERS } from '@/lib/constants'
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, PhoneCall } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceChatProps {
  roomId: string
  userId: string
  displayName: string
  players: RoomPlayer[]
}

interface PeerConnection {
  userId: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

export const VoiceChat: React.FC<VoiceChatProps> = ({
  roomId, userId, displayName, players
}) => {
  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set())
  const [volume, setVolume] = useState(100)
  
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, PeerConnection>>(new Map())
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const speakingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const joinVoice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
        video: false,
      })
      
      localStreamRef.current = stream
      setIsJoined(true)
      setPermissionError(null)
      
      // Set up audio analysis for speaking detection
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const analyser = audioCtx.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 512
      
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      
      speakingIntervalRef.current = setInterval(() => {
        if (analyser && !isMuted) {
          const data = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(data)
          const avg = data.reduce((a, b) => a + b, 0) / data.length
          if (avg > 15) {
            setSpeakingUsers(prev => new Set([...prev, userId]))
          } else {
            setSpeakingUsers(prev => {
              const next = new Set(prev)
              next.delete(userId)
              return next
            })
          }
        }
      }, 100)
      
      toast.success('انضممت للصوت! 🎤')
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('تحتاج لاذن المايك في المتصفح')
        toast.error('لازم تسمح بالوصول للمايك')
      } else if (err.name === 'NotFoundError') {
        setPermissionError('ما لقيت مايك - تأكد إنه موصول')
        toast.error('ما في مايك')
      } else {
        setPermissionError('فشل الاتصال بالصوت')
        toast.error('مشكلة في الصوت')
      }
    }
  }, [isMuted, userId])

  const leaveVoice = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    
    peersRef.current.forEach(peer => peer.connection.close())
    peersRef.current.clear()
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current)
    }
    
    setSpeakingUsers(new Set())
    setIsJoined(false)
  }, [])

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
        if (!isMuted) {
          setSpeakingUsers(prev => {
            const next = new Set(prev)
            next.delete(userId)
            return next
          })
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      if (isJoined) leaveVoice()
    }
  }, [])

  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <div>
          <p className="text-white font-semibold">مشكلة في الصوت</p>
          <p className="text-slate-400 text-sm mt-1">{permissionError}</p>
        </div>
        <Button variant="primary" size="sm" onClick={joinVoice}>
          حاول مرة ثانية
        </Button>
        <button className="text-xs text-slate-500" onClick={() => setPermissionError(null)}>
          الاستمرار بدون صوت
        </button>
      </div>
    )
  }

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Mic size={28} className="text-purple-400" />
        </div>
        <div>
          <p className="text-white font-semibold">الدردشة الصوتية</p>
          <p className="text-slate-400 text-sm mt-1">تكلم مع الكل بشكل مباشر أثناء اللعب</p>
        </div>
        <Button variant="primary" onClick={joinVoice} leftIcon={<PhoneCall size={16} />}>
          انضم للصوت
        </Button>
        <p className="text-xs text-slate-600">الصوت اختياري ولا يؤثر على اللعبة</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Voice Controls */}
      <div className="flex items-center justify-between p-3 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">صوت متصل</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg transition-all ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white'
            }`}
            title={isMuted ? 'رفع الصوت' : 'كتم'}
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className={`p-1.5 rounded-lg transition-all ${
              isDeafened ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white'
            }`}
            title={isDeafened ? 'تشغيل الصوت' : 'كتم الكل'}
          >
            {isDeafened ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button
            onClick={leaveVoice}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
            title="مغادرة الصوت"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="px-3 py-2 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <Volume2 size={12} className="text-slate-500" />
          <input
            type="range"
            min={0}
            max={200}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="flex-1 accent-purple-500 h-1"
          />
          <span className="text-xs text-slate-500 w-8">{volume}%</span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-xs text-slate-500 mb-2">في القناة الصوتية:</p>
        
        {/* Current user */}
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          speakingUsers.has(userId) ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/[0.03]'
        }`}>
          <Mic size={12} className={isMuted ? 'text-red-400' : 'text-green-400'} />
          <span className="text-sm text-white">أنت</span>
          {isMuted && <span className="text-xs text-red-400">(مكتوم)</span>}
          {speakingUsers.has(userId) && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-auto" />}
        </div>

        {players
          .filter(p => p.user_id !== userId)
          .map(player => (
            <div key={player.id} className={`flex items-center gap-2 p-2 rounded-lg ${
              speakingUsers.has(player.user_id)
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-white/[0.03]'
            }`}>
              <Avatar color={player.avatar_color} emoji={player.avatar_emoji} size="xs" />
              <span className="text-sm text-white truncate">{player.display_name}</span>
              {speakingUsers.has(player.user_id) && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-auto" />
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
