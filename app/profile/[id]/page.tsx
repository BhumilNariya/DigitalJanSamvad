'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { IssueCard, type Issue } from '@/components/issue-card'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  TrendingUp,
  MapPin,
  MessageCircle,
  Share2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Mail,
  Calendar,
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  bio: string
  joinDate: Date
  location: string
  points: number
  issuesReported: number
  issuesResolved: number
  rank: number
  achievements: Array<{
    icon: string
    label: string
    description: string
  }>
  recentIssues: Issue[]
}

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Rajesh Patel',
  bio: 'Passionate about making Gujarat cleaner and safer. Active citizen of Vadodara working towards Swachh Bharat mission.',
  joinDate: new Date('2024-06-15'),
  location: 'Alkapuri, Vadodara',
  points: 2450,
  issuesReported: 28,
  issuesResolved: 12,
  rank: 1,
  achievements: [
    {
      icon: '🏆',
      label: 'Top Contributor',
      description: 'Ranked #1 in Gujarat community',
    },
    {
      icon: '⚡',
      label: 'Quick Reporter',
      description: 'Reported 5+ issues in a week',
    },
    {
      icon: '✨',
      label: 'Nagrik Samman',
      description: 'Helped resolve 10+ civic issues',
    },
  ],
  recentIssues: [
    {
      id: '1',
      title: 'Pothole on MG Road',
      description: 'Large pothole causing accidents near Lal Darwaja, immediate repair needed',
      location: 'MG Road, Vadodara',
      status: 'in-progress',
      category: 'Infrastructure',
      upvotes: 248,
      comments: 32,
    },
    {
      id: '2',
      title: 'Public Garden Renovation Complete',
      description: 'Sayaji Baug garden benches and pathways have been successfully repaired',
      location: 'Sayaji Baug, Vadodara',
      status: 'resolved',
      category: 'Parks',
      upvotes: 89,
      comments: 12,
    },
  ],
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const profile = mockProfile // In a real app, fetch based on params.id

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400'
    if (rank === 2) return 'bg-slate-300'
    if (rank === 3) return 'bg-amber-600'
    return 'bg-primary'
  }

  return (
    <div className="w-full">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Leaderboard
        </Link>
      </div>

      {/* Profile Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:items-start">
                <div
                  className={`${getMedalColor(profile.rank)} w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4`}
                >
                  {profile.name[0]}
                </div>
                {profile.rank <= 3 && (
                  <Badge className="bg-primary text-primary-foreground mb-2">
                    <Award className="w-3 h-3 mr-1" />
                    Rank #{profile.rank}
                  </Badge>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
                <p className="text-muted-foreground mb-4">{profile.bio}</p>

                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Joined
                    </div>
                    <p className="font-semibold text-foreground">
                      {profile.joinDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <MapPin className="w-4 h-4" />
                      Location
                    </div>
                    <p className="font-semibold text-foreground">{profile.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Mail className="w-4 h-4" />
                      Contact
                    </div>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Message
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats and Achievements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Points Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Total Points</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground">{profile.points}</p>
              <p className="text-xs text-muted-foreground mt-2">Points earned from contributions</p>
            </CardContent>
          </Card>

          {/* Issues Reported Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Issues Reported</span>
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground">{profile.issuesReported}</p>
              <p className="text-xs text-muted-foreground mt-2">Issues identified and reported</p>
            </CardContent>
          </Card>

          {/* Issues Resolved Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Issues Resolved</span>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground">{profile.issuesResolved}</p>
              <p className="text-xs text-muted-foreground mt-2">Issues helped to resolve</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.achievements.map((achievement, idx) => (
              <Card key={idx}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{achievement.label}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Issues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.recentIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  )
}
