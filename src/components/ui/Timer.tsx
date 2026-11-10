import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TimerProps {
  duration: number
  onComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'electric' | 'gold' | 'danger'
  className?: string
  paused?: boolean
}

const colorMap = {
  purple: '#7c3aed',
  electric: '#06b6d4',
  gold: '#f59e0b',
  danger: '#ef4444',
}

export const Timer: React.FC<TimerProps> = ({
  duration,
  onComplete,
  size = 'md',
  color = 'purple',
  className,
  paused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 36
  const circumference = 2 * Math.PI * radius
  const strokeWidth = size === 'sm' ? 3 : 4
  const svgSize = (radius + strokeWidth) * 2
  
  const progress = timeLeft / duration
  const strokeDashoffset = circumference * (1 - progress)
  
  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])
  
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, onComplete])
  
  const isLow = timeLeft <= duration * 0.25
  const displayColor = isLow ? '#ef4444' : colorMap[color]
  
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={svgSize}
        height={svgSize}
        className={cn(isLow && 'animate-pulse')}
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className={cn('absolute font-bold tabular-nums', textSize)} style={{ color: displayColor }}>
        {timeLeft}
      </div>
    </div>
  )
}

// Simple countdown bar
interface TimerBarProps {
  duration: number
  onComplete?: () => void
  color?: string
  className?: string
}

export const TimerBar: React.FC<TimerBarProps> = ({ duration, onComplete, color = '#7c3aed', className }) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  
  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onComplete])
  
  const progress = (timeLeft / duration) * 100
  const isLow = timeLeft <= duration * 0.25
  
  return (
    <div className={cn('w-full h-2 bg-white/10 rounded-full overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${progress}%`,
          background: isLow ? '#ef4444' : color,
          boxShadow: `0 0 8px ${isLow ? '#ef444480' : `${color}80`}`,
        }}
      />
    </div>
  )
}
