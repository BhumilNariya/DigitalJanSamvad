'use client'

import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/stats-card'
import { IssueCard, type Issue } from '@/components/issue-card'
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
} from 'lucide-react'

import { useEffect, useState } from 'react';
import { leaderboardApi } from '@/lib/api';

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await leaderboardApi.getTopUsers();
      if (res.success && res.data) {
        const formatted = res.data.map((user: any, index: number) => ({
          id: user._id,
          name: user.name,
          points: user.points,
          issuesReported: user.issuesReported,
          rank: index + 1,
        }));
        setLeaderboard(formatted);
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, []);
  return (
    <div className="w-full">
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Your Voice Matters
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty">
              Report community issues, track progress, and empower your neighborhood to solve problems together. Make your city better, one report at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/report">
                  Report an Issue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/issues">Browse Issues</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Issues"
            value="1,247"
            icon={AlertCircle}
            description="Issues reported this year"
          />
          <StatsCard
            label="Resolved"
            value="856"
            icon={CheckCircle2}
            description="Successfully addressed"
          />
          <StatsCard
            label="Active Community"
            value="4,293"
            icon={Users}
            description="Community members"
          />
          <StatsCard
            label="In Progress"
            value="142"
            icon={TrendingUp}
            description="Currently being worked on"
          />
        </div>
      </section>

      {/* Community Issues Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <IssuesMap />
      </section>

      {/* Trending Issues Section */}
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Trending Issues</h2>
              <p className="text-muted-foreground">
                The most active issues in your community
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/issues">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <TrendingIssues />
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Community Heroes</h2>
            <p className="text-muted-foreground">
              Top contributors making a difference
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/leaderboard">
              View Leaderboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <p>Loading ranking...</p>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((entry) => (
              <LeaderboardCard key={entry.id} entry={entry} />
            ))
          ) : (
            <p className="text-muted-foreground">No community heroes yet.</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            See Something? Say Something.
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Your report could be the first step to solving a community problem.
            Every voice counts.
          </p>
          <Button size="lg" variant="secondary" asChild>
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
