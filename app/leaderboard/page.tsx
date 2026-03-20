'use client'

import { useState, useMemo } from 'react'
import { LeaderboardCard, type LeaderboardEntry } from '@/components/leaderboard-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Medal, TrendingUp, Zap } from 'lucide-react'

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: 'user-1',
    name: 'Rajesh Patel',
    points: 2450,
    issuesReported: 28,
    rank: 1,
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    points: 2180,
    issuesReported: 24,
    rank: 2,
  },
  {
    id: 'user-3',
    name: 'Amit Desai',
    points: 1890,
    issuesReported: 21,
    rank: 3,
  },
  {
    id: 'user-4',
    name: 'Neha Mehta',
    points: 1650,
    issuesReported: 18,
    rank: 4,
  },
  {
    id: 'user-5',
    name: 'Vikram Joshi',
    points: 1420,
    issuesReported: 16,
    rank: 5,
  },
  {
    id: 'user-6',
    name: 'Kavita Thakkar',
    points: 1280,
    issuesReported: 14,
    rank: 6,
  },
  {
    id: 'user-7',
    name: 'Dharmesh Shah',
    points: 1100,
    issuesReported: 12,
    rank: 7,
  },
  {
    id: 'user-8',
    name: 'Meera Parmar',
    points: 950,
    issuesReported: 11,
    rank: 8,
  },
  {
    id: 'user-9',
    name: 'Suresh Solanki',
    points: 820,
    issuesReported: 9,
    rank: 9,
  },
  {
    id: 'user-10',
    name: 'Hetal Trivedi',
    points: 720,
    issuesReported: 8,
    rank: 10,
  },
]

type SortBy = 'points' | 'issues' | 'recent'

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>('points')
  const [filterTimeframe, setFilterTimeframe] = useState<'all-time' | 'month' | 'week'>('all-time')

  const sortedLeaderboard = useMemo(() => {
    const sorted = [...mockLeaderboard]

    if (sortBy === 'points') {
      sorted.sort((a, b) => b.points - a.points)
    } else if (sortBy === 'issues') {
      sorted.sort((a, b) => b.issuesReported - a.issuesReported)
    } else if (sortBy === 'recent') {
      // In a real app, this would sort by most recent activity
      sorted.reverse()
    }

    return sorted.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }))
  }, [sortBy])

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Community Leaderboard</h1>
          <p className="text-muted-foreground text-lg">
            Celebrate our most active community members making a difference
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Sort By</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={sortBy === 'points' ? 'default' : 'outline'}
                  onClick={() => setSortBy('points')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Points
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === 'issues' ? 'default' : 'outline'}
                  onClick={() => setSortBy('issues')}
                >
                  <Medal className="w-4 h-4 mr-2" />
                  Issues Reported
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  onClick={() => setSortBy('recent')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Recent Activity
                </Button>
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Timeframe</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filterTimeframe === 'week' ? 'default' : 'outline'}
                  onClick={() => setFilterTimeframe('week')}
                >
                  This Week
                </Button>
                <Button
                  size="sm"
                  variant={filterTimeframe === 'month' ? 'default' : 'outline'}
                  onClick={() => setFilterTimeframe('month')}
                >
                  This Month
                </Button>
                <Button
                  size="sm"
                  variant={filterTimeframe === 'all-time' ? 'default' : 'outline'}
                  onClick={() => setFilterTimeframe('all-time')}
                >
                  All Time
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Contributors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {sortedLeaderboard.slice(0, 3).map((entry, idx) => (
            <div key={entry.id} className={idx === 0 ? 'md:col-span-1' : ''}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3 ${
                        entry.rank === 1
                          ? 'bg-yellow-400'
                          : entry.rank === 2
                            ? 'bg-slate-300'
                            : 'bg-amber-600'
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{entry.name}</h3>
                    {entry.rank <= 3 && (
                      <Medal className="w-5 h-5 text-primary mx-auto mb-3" />
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">Points</p>
                      <p className="text-2xl font-bold text-foreground">{entry.points}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">Issues Reported</p>
                      <p className="text-2xl font-bold text-foreground">{entry.issuesReported}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Full Leaderboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Full Rankings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedLeaderboard.map((entry) => (
            <LeaderboardCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* Leaderboard Info */}
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">How Points Are Earned</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Report an Issue</h3>
                <p className="text-sm text-muted-foreground">
                  Earn 50 points for each new issue you report
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Get Upvotes</h3>
                <p className="text-sm text-muted-foreground">
                  Earn 1 point for each upvote your report receives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Contribute Comments</h3>
                <p className="text-sm text-muted-foreground">
                  Earn 10 points for helpful comments with upvotes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
