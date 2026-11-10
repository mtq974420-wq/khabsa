import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  color: string
  emoji: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  isHost?: boolean
  isSpeaking?: boolean
  isMuted?: boolean
  className?: string
  onClick?: () => void
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
  '2xl': 'w-20 h-20 text-3xl',
}

export const Avatar: React.FC<AvatarProps> = ({
  color,
  emoji,
  size = 'md',
  isHost = false,
  isSpeaking = false,
  isMuted = false,
  className,
  onClick,
}) => {
  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div
        onClick={onClick}
        className={cn(
          'rounded-full flex items-center justify-center font-bold select-none',
          'transition-all duration-200',
          sizeMap[size],
          isSpeaking && 'ring-2 ring-green-400 ring-offset-1 ring-offset-gray-900',
          isHost && !isSpeaking && 'ring-2 ring-offset-1 ring-offset-gray-900',
          onClick && 'cursor-pointer hover:scale-105',
        )}
        style={{
          background: `linear-gradient(135deg, ${color}cc, ${color}88)`,
          boxShadow: isSpeaking 
            ? `0 0 15px rgba(74, 222, 128, 0.5)` 
            : `0 0 10px ${color}40`,
          outline: isHost && !isSpeaking ? `2px solid ${color}` : undefined,
        }}
      >
        <span style={{ fontSize: size === 'xs' ? '0.6rem' : undefined }}>{emoji}</span>
      </div>
      
      {isHost && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-xs">
          👑
        </div>
      )}
      
      {isMuted && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs">
          🔇
        </div>
      )}
    </div>
  )
}
