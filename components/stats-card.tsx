'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
}

export function StatsCard({ label, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="surface-card group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
            )}
          </div>
          <div className="ml-2 rounded-xl border border-primary/10 bg-linear-to-br from-primary/15 to-accent/15 p-3 text-primary transition-transform duration-300 group-hover:scale-105">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
