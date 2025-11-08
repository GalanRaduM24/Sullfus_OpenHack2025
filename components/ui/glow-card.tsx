'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({ children, className, glowColor = 'blue' }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative group rounded-2xl p-8 bg-white border border-slate-200',
        'before:absolute before:inset-0 before:rounded-2xl',
        `before:bg-gradient-to-br before:from-${glowColor}-500/0 before:to-${glowColor}-500/0`,
        `before:group-hover:from-${glowColor}-500/20 before:group-hover:to-${glowColor}-500/10`,
        'before:blur-xl before:transition-all before:duration-500',
        'before:-z-10',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

