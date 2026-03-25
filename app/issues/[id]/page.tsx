'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge, type IssueStatus } from '@/components/status-badge'
import { CommentBox, type Comment } from '@/components/comment-box'
import {
  MapPin,
  Clock,
  MessageCircle,
  Share2,
  Flag,
  ThumbsUp,
  ChevronLeft,
  Calendar,
  User,
} from 'lucide-react'

interface IssueDetail {
  id: string
  title: string
  description: string
  longDescription: string
  location: string
  status: IssueStatus
  category: string
  upvotes: number
  comments: Comment[]
  reportedBy: string
  reportedDate: Date
  image?: string
  updates: Array<{
    date: Date
    message: string
  }>
}

const mockIssueDetails: Record<string, IssueDetail> = {
  '1': {
    id: '1',
    title: 'Pothole on MG Road',
    description: 'Large pothole causing accidents near Lal Darwaja, immediate repair needed',
    longDescription:
      'A significant pothole has formed on MG Road near the Lal Darwaja area in Vadodara. This pothole is affecting traffic flow and poses a serious safety risk to two-wheelers and auto-rickshaws. The recent monsoon rains have worsened the damage significantly. Multiple citizens have reported the issue through Jan Samvad portal and it requires immediate attention from the Vadodara Municipal Corporation (VMC).',
    location: 'MG Road, Vadodara',
    status: 'in-progress',
    category: 'Infrastructure',
    upvotes: 248,
    reportedBy: 'Rajesh Patel',
    reportedDate: new Date('2026-03-10'),
    updates: [
      {
        date: new Date('2026-03-12'),
        message: 'VMC road maintenance team has assessed the issue and scheduled repair work',
      },
      {
        date: new Date('2026-03-15'),
        message: 'Repair work is expected to begin after coordination with traffic police',
      },
    ],
    comments: [
      {
        id: 'c1',
        author: 'Priya Sharma',
        content: 'This pothole is getting worse! My scooty got damaged yesterday. Very dangerous for two-wheelers.',
        timestamp: new Date('2026-03-11'),
        upvotes: 34,
      },
      {
        id: 'c2',
        author: 'Amit Desai',
        content: 'Finally VMC is taking action. This has been a problem for months during monsoon season.',
        timestamp: new Date('2026-03-13'),
        upvotes: 12,
      },
    ],
  },
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const issue = mockIssueDetails[id] || mockIssueDetails['1']
  const [upvoted, setUpvoted] = useState(false)
  const [localComments, setLocalComments] = useState<Comment[]>(issue.comments)

  const handleUpvote = () => {
    setUpvoted(!upvoted)
  }

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: `c${localComments.length + 1}`,
      author: 'You',
      content,
      timestamp: new Date(),
      upvotes: 0,
    }
    setLocalComments([...localComments, newComment])
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Issues
        </Link>
      </div>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-3">{issue.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-xs bg-secondary rounded-full px-3 py-1 text-secondary-foreground">
                    {issue.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{issue.location}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reported By</p>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{issue.reportedBy}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reported Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {issue.reportedDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Support</p>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {issue.upvotes + (upvoted ? 1 : 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-foreground leading-relaxed">{issue.longDescription}</p>
              </CardContent>
            </Card>

            {/* Updates */}
            {issue.updates.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Updates</h2>
                  <div className="space-y-4">
                    {issue.updates.map((update, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mt-2" />
                          {idx < issue.updates.length - 1 && (
                            <div className="w-0.5 h-12 bg-border my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            {update.date.toLocaleDateString()}
                          </p>
                          <p className="text-foreground">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardContent className="p-6">
                <CommentBox
                  comments={localComments}
                  onAddComment={handleAddComment}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full"
                  variant={upvoted ? 'default' : 'outline'}
                  onClick={handleUpvote}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {upvoted ? 'Upvoted' : 'Upvote'}
                </Button>
                <Button className="w-full" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="w-full text-destructive" variant="outline">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </CardContent>
            </Card>

            {/* Related Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">About This Issue</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Category</p>
                    <p className="text-foreground font-medium">{issue.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Status</p>
                    <StatusBadge status={issue.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Total Support</p>
                    <p className="text-foreground font-medium">
                      {issue.upvotes + (upvoted ? 1 : 0)} upvotes
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Comments</p>
                    <p className="text-foreground font-medium">{localComments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
