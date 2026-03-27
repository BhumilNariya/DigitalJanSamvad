'use client'

import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/stats-card'
import { LeaderboardCard, type LeaderboardEntry } from '@/components/leaderboard-card'
import TrendingIssues from '@/components/trending-issues'
import { IssuesMap } from '@/components/issues-map'
import Link from 'next/link'
import {
  TrendingUp,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock3,
  BadgeCheck,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import { issuesApi, leaderboardApi, extractIssuesPayload } from '@/lib/api'

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    activeCommunity: 0,
    inProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHomepageData = async () => {
      const [leaderboardRes, issuesRes] = await Promise.all([
        leaderboardApi.getTopUsers(),
        issuesApi.getAll({ limit: 500 }),
      ])

      if (leaderboardRes.success && leaderboardRes.data) {
        const formatted = leaderboardRes.data.map((user: any, index: number) => ({
          id: user._id,
          name: user.name,
          points: user.points,
          issuesReported: user.issuesReported,
          rank: index + 1,
        }))
        setLeaderboard(formatted)
      }

      if (issuesRes.success && issuesRes.data) {
        const payload = extractIssuesPayload(issuesRes.data)
        const issues = payload.issues as any[]
        setStats({
          totalIssues: payload.totalIssues,
          resolvedIssues: issues.filter((issue) => issue.status === 'resolved' || issue.status === 'closed').length,
          activeCommunity: leaderboardRes.success && leaderboardRes.data ? leaderboardRes.data.length : 0,
          inProgress: issues.filter((issue) => issue.status === 'assigned' || issue.status === 'in-progress').length,
        })
      }

      setIsLoading(false)
    }

    fetchHomepageData()
  }, [])

  return (
    <div className="w-full">
      <section className="overflow-hidden border-b border-border bg-linear-to-br from-primary/12 via-background to-secondary/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Civic reporting made transparent
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
                Report civic issues with clarity. Track action with trust.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl leading-relaxed">
                Digital Jan Samvad helps citizens report local problems, follow verified progress, and hold civic action visible from submission to resolution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="rounded-xl px-6" asChild>
                  <Link href="/report">
                    Report an Issue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl px-6 bg-white/80" asChild>
                  <Link href="/issues">Browse Issues</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="surface-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Transparency</p>
                  <p className="text-sm text-foreground font-medium">Track issue status from reporting to closure.</p>
                </div>
                <div className="surface-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Verification</p>
                  <p className="text-sm text-foreground font-medium">Only verified reports unlock rewards and trust.</p>
                </div>
                <div className="surface-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Civic Action</p>
                  <p className="text-sm text-foreground font-medium">Live map and dashboards keep communities informed.</p>
                </div>
              </div>
            </div>

            <div className="surface-card subtle-grid p-6 sm:p-7">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/70 bg-white/90 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Resolved</p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{stats.resolvedIssues}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Reports closed with visible progress.</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-white/90 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">In Motion</p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{stats.inProgress}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Assigned or in-progress civic work.</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-white/90 p-5 col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Response Trust</p>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-3xl font-bold tracking-tight text-foreground">
                        {stats.totalIssues > 0 ? `${Math.round((stats.resolvedIssues / stats.totalIssues) * 100)}%` : '0%'}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">Visible resolution rate from live reports.</p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-accent text-white flex items-center justify-center shadow-sm">
                      <BadgeCheck className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Issues"
            value={stats.totalIssues}
            icon={AlertCircle}
            description="Live reports submitted by the community"
          />
          <StatsCard
            label="Resolved"
            value={stats.resolvedIssues}
            icon={CheckCircle2}
            description="Closed or resolved civic issues"
          />
          <StatsCard
            label="Active Community"
            value={stats.activeCommunity}
            icon={Users}
            description="Visible contributors on the leaderboard"
          />
          <StatsCard
            label="In Progress"
            value={stats.inProgress}
            icon={TrendingUp}
            description="Currently assigned or under action"
          />
        </div>
      </section>

      <section className="bg-secondary/60 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-shell">
          <div className="mb-8">
            <h2 className="section-heading mb-2">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl">A simple civic workflow designed for transparency and accountability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { title: 'Report', desc: 'Citizens submit an issue with location, details, and evidence.', icon: MapPin },
              { title: 'Verify', desc: 'Reports are reviewed to validate the issue before escalation.', icon: ShieldCheck },
              { title: 'Resolve', desc: 'Staff take action, update status, and close the civic loop.', icon: CheckCircle2 },
              { title: 'Track', desc: 'Residents can follow progress and view outcomes in one place.', icon: Clock3 },
            ].map(({ title, desc, icon: Icon }, index) => (
              <div key={title} className="surface-card p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Step {index + 1}</p>
                <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-shell">
        <IssuesMap />
      </section>

      <section className="bg-secondary/70 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-shell">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Trending Issues</h2>
              <p className="text-muted-foreground">
                The most active issues in your community
              </p>
            </div>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/issues">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <TrendingIssues />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-shell">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Community Heroes</h2>
            <p className="text-muted-foreground">
              Top contributors making a difference
            </p>
          </div>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/leaderboard">
              View Leaderboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-card p-5">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : leaderboard.length > 0 ? (
            leaderboard.map((entry) => (
              <LeaderboardCard key={entry.id} entry={entry} />
            ))
          ) : (
            <p className="text-muted-foreground">No community heroes yet.</p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-shell pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="surface-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Recent Resolution Confidence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">The platform highlights resolved and closed issues so citizens can see visible follow-through, not just submissions.</p>
          </div>
          <div className="surface-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Transparent Workflow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every issue moves through clearly defined civic stages, helping residents understand what happens after reporting.</p>
          </div>
          <div className="surface-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Community Accountability</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Leaderboards and public issue tracking reward consistent civic participation while keeping local action visible.</p>
          </div>
        </div>
      </section>

      <section className="bg-linear-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            See Something? Say Something.
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Your report could be the first step to solving a community problem.
            Every voice counts.
          </p>
          <Button size="lg" variant="secondary" className="rounded-xl" asChild>
            <Link href="/report">
              Report an Issue Now
              <MapPin className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
