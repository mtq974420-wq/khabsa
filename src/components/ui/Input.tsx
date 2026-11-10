import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            'w-full bg-[#1a1a2e]/80 border rounded-xl px-4 py-3',
            'text-white placeholder-slate-500',
            'font-cairo text-base',
            'outline-none transition-all duration-200',
            'focus:ring-2 focus:ring-purple-500/30',
            error
              ? 'border-red-500/70 focus:border-red-400'
              : 'border-purple-500/30 focus:border-purple-500/70',
            leftIcon && 'pr-10',
            rightIcon && 'pl-10',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full bg-[#1a1a2e]/80 border rounded-xl px-4 py-3',
          'text-white placeholder-slate-500',
          'font-cairo text-base resize-none',
          'outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-purple-500/30',
          error
            ? 'border-red-500/70 focus:border-red-400'
            : 'border-purple-500/30 focus:border-purple-500/70',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}
