'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  className?: string
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  return (
    <div className={cn("relative w-full h-full perspective-1000", className)}>
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        whileHover={{ rotateY: 180 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 backface-hidden">
          {front}
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          {back}
        </div>
      </motion.div>
    </div>
  )
}

