'use client'

import Link from 'next/link'
import { MessageSquareText } from 'lucide-react'

interface BrandProps {
  compact?: boolean
  href?: string
  className?: string
}

export function Brand({ compact = false, href = '/', className = '' }: BrandProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
        <MessageSquareText className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
          Civic-Tech Platform
        </div>
        <div className={`font-bold tracking-tight text-foreground ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>
          Digital Jan Samvad
        </div>
      </div>
    </div>
  )

  return (
    <Link href={href} className="group inline-flex items-center">
      {content}
    </Link>
  )
}
