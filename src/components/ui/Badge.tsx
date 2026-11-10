import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'electric' | 'gold' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
  pulse?: boolean
}

const variants = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  electric: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  gold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  ghost: 'bg-white/5 text-slate-300 border-white/10',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'sm',
  className,
  pulse = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        pulse && 'animate-pulse',
        className,
      )}
    >
      {children}
    </span>
  )
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, className }) => {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
      'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      className,
    )}>
      ⭐ {score.toLocaleString()}
    </span>
  )
}
