import React, { useState, useRef, useEffect } from 'react'
import { useRoomStore } from '@/stores/roomStore'
import { Avatar } from '@/components/ui/Avatar'
import { Send, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatPanelProps {
  roomId: string
  userId: string
  displayName: string
  avatarColor: string
  avatarEmoji: string
}

const QUICK_EMOJIS = ['😂', '🎉', '🔥', '👑', '😱', '🤔', '💀', '👏']

export const ChatPanel: React.FC<ChatPanelProps> = ({
  userId, displayName, avatarColor, avatarEmoji
}) => {
  const { messages, sendMessage } = useRoomStore()
  const [input, setInput] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    sendMessage(userId, displayName, avatarColor, avatarEmoji, text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-8">
            <div className="text-3xl mb-2">💬</div>
            ابدأ المحادثة!
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={cn(
            'flex gap-2',
            msg.user_id === userId ? 'flex-row-reverse' : 'flex-row',
            msg.type === 'system' && 'justify-center'
          )}>
            {msg.type === 'system' ? (
              <div className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                {msg.content}
              </div>
            ) : (
              <>
                {msg.user_id !== userId && (
                  <Avatar color={msg.avatar_color} emoji={msg.avatar_emoji} size="xs" className="mt-1 flex-shrink-0" />
                )}
                <div className={cn(
                  'max-w-[75%] flex flex-col',
                  msg.user_id === userId ? 'items-end' : 'items-start'
                )}>
                  {msg.user_id !== userId && (
                    <span className="text-xs text-slate-500 mb-1 mr-1">{msg.display_name}</span>
                  )}
                  <div className={cn(
                    'px-3 py-1.5 rounded-2xl text-sm',
                    msg.user_id === userId
                      ? 'bg-purple-600 text-white rounded-tl-sm'
                      : 'bg-white/10 text-white rounded-tr-sm'
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-600 mt-0.5">
                    {new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick emojis */}
      {showEmojis && (
        <div className="flex gap-2 px-3 py-2 border-t border-purple-500/10 flex-wrap">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                sendMessage(userId, displayName, avatarColor, avatarEmoji, emoji)
                setShowEmojis(false)
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-purple-500/10 flex items-center gap-2">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
          <Smile size={18} />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة..."
          maxLength={200}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="text-purple-400 hover:text-purple-300 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
