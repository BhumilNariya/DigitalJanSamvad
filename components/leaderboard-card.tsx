'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Medal, TrendingUp, ShieldCheck } from 'lucide-react'

export interface LeaderboardEntry {
  id: string
  name: string
  points: number
  issuesReported: number
  avatar?: string
  rank: number
  metricLabel?: string
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry
}

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400'
      case 2:
        return 'bg-slate-300'
      case 3:
        return 'bg-amber-600'
      default:
        return 'bg-primary'
    }
  }

  return (
    <Link href={`/profile/${entry.id}`}>
      <Card className={`surface-card cursor-pointer transition-all duration-300 hover:-translate-y-1 ${entry.rank <= 3 ? 'border-primary/25 bg-linear-to-br from-card to-secondary/60' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div className={`${getMedalColor(entry.rank)} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="font-bold text-lg text-white">{entry.rank}</span>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate text-lg">{entry.name}</h3>
                {entry.rank <= 3 && (
                  <Medal className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {entry.issuesReported} issues reported
              </p>
              <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Civic Contributor
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">{entry.points}</span>
                <span className="text-xs text-muted-foreground">{entry.metricLabel || 'points'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
