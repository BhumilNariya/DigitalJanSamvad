'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Medal, TrendingUp } from 'lucide-react'

export interface LeaderboardEntry {
  id: string
  name: string
  points: number
  issuesReported: number
  avatar?: string
  rank: number
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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div className={`${getMedalColor(entry.rank)} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="font-bold text-lg text-white">{entry.rank}</span>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{entry.name}</h3>
                {entry.rank <= 3 && (
                  <Medal className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {entry.issuesReported} issues reported
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">{entry.points}</span>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
