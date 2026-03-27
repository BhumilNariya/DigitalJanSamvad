'use client'

import { useEffect, useMemo, useState } from 'react'
import { LeaderboardCard, type LeaderboardEntry } from '@/components/leaderboard-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Medal, TrendingUp, Zap } from 'lucide-react'
import { leaderboardApi } from '@/lib/api'

type SortBy = 'points' | 'issues' | 'recent'
type Timeframe = 'all-time' | 'month' | 'week'

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>('points')
  const [filterTimeframe, setFilterTimeframe] = useState<Timeframe>('all-time')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const metricLabel = sortBy === 'issues' && filterTimeframe === 'all-time' ? 'issues' : 'points'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)

      const response = filterTimeframe === 'week'
        ? await leaderboardApi.getWeekly()
        : filterTimeframe === 'month'
          ? await leaderboardApi.getMonthly()
          : sortBy === 'issues'
            ? await leaderboardApi.getMostReported()
            : await leaderboardApi.getTopUsers()

      if (response.success && response.data) {
        const formatted = response.data.map((entry: any, index: number) => ({
          id: entry._id || entry.id,
          name: entry.name,
          points: filterTimeframe === 'week'
            ? entry.weeklyPoints ?? entry.score ?? 0
            : filterTimeframe === 'month'
              ? entry.monthlyPoints ?? entry.score ?? 0
              : sortBy === 'issues'
                ? entry.score ?? entry.issuesReported ?? 0
                : entry.points ?? entry.score ?? 0,
          issuesReported: entry.issuesReported ?? 0,
          rank: entry.rank ?? index + 1,
          metricLabel: sortBy === 'issues' && filterTimeframe === 'all-time' ? 'issues' : 'points',
        }))
        setLeaderboard(formatted)
      } else {
        setLeaderboard([])
      }

      setLoading(false)
    }

    fetchLeaderboard()
  }, [filterTimeframe, sortBy])

  const sortedLeaderboard = useMemo(() => {
    const sorted = [...leaderboard]

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
  }, [leaderboard, sortBy])

  return (
    <div className="w-full">
      {/* Header */}
      <section className="border-b border-border bg-linear-to-br from-primary/10 via-background to-secondary/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Community Leaderboard</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Celebrate our most active community members making a difference
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border bg-background/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="surface-card grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Sort By</label>
              <div className="inline-flex flex-wrap gap-2 rounded-xl bg-secondary/70 p-1.5">
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
              <div className="inline-flex flex-wrap gap-2 rounded-xl bg-secondary/70 p-1.5">
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
              <Card className={`surface-card h-full transition-all duration-300 hover:-translate-y-1 ${entry.rank === 1 ? 'bg-linear-to-br from-primary/10 to-accent/10 border-primary/25' : 'bg-linear-to-br from-card to-secondary/60'}`}>
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
                      <p className="text-muted-foreground mb-1">{metricLabel === 'issues' ? 'Issues Reported' : 'Points'}</p>
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-card p-5">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedLeaderboard.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedLeaderboard.map((entry) => (
              <LeaderboardCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No leaderboard data available yet.</p>
        )}
      </section>

      {/* Leaderboard Info */}
      <section className="bg-secondary/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">How Points Are Earned</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="surface-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Report an Issue</h3>
                <p className="text-sm text-muted-foreground">
                  Earn rewards once your reported issue is verified
                </p>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Get Upvotes</h3>
                <p className="text-sm text-muted-foreground">
                  Earn 1 point for each upvote your report receives
                </p>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Contribute Comments</h3>
                <p className="text-sm text-muted-foreground">
                  Verified reports and resolutions unlock badges over time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
