'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import type { IssueStatus } from '@/lib/types'
import { CommentSection } from '@/components/comment-section'
import { useSocket } from '@/hooks/useSocket'
import { issuesApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
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
      'A significant pothole has formed on MG Road near the Lal Darwaja area in Vadodara. This pothole is affecting traffic flow and poses a serious safety risk to two-wheelers and auto-rickshaws. The recent monsoon rains have worsened the damage significantly. Multiple citizens have reported the issue through Digital Jan Samvad portal and it requires immediate attention from the Vadodara Municipal Corporation (VMC).',
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
  },
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { updateUser } = useAuth()
  
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const [upvoteLoading, setUpvoteLoading] = useState(false)
  
  const socket = useSocket()

  const fetchIssueData = () => {
    issuesApi.getById(id).then(res => {
        if (res.success && res.data) {
          // Map backend data to our frontend format
          const dbIssue = res.data as any
          // Generate a user-friendly timeline message based on status
          const getTimelineMessage = (status: string, person?: string) => {
            const nameStr = person ? ` (by ${person})` : '';
            switch(status) {
              case 'pending': return 'Issue was reported and received by the system.';
              case 'verified': return `Issue was reviewed and verified as valid${nameStr}.`;
              case 'assigned': return `Issue has been assigned to a response team${nameStr}.`;
              case 'in-progress': return `Field work has officially started${nameStr}.`;
              case 'resolved': return `Issue marked as resolved by the field team${nameStr}.`;
              case 'closed': return `Issue has been officially closed${nameStr}.`;
              case 'rejected': return `Issue was rejected${nameStr}.`;
              default: return `Status updated to ${status}.`;
            }
          };

          // Map the statusHistory into frontend updates using chronological order
          const mappedUpdates = (dbIssue.statusHistory || []).map((historyItem: any) => ({
            date: new Date(historyItem.updatedAt),
            message: getTimelineMessage(historyItem.status, historyItem.updatedBy?.name)
          }));

          setIssue({
            id: dbIssue._id,
            title: dbIssue.title,
            description: dbIssue.description,
            longDescription: dbIssue.description,
            image: dbIssue.imageUrl,
            location: dbIssue.location || 'Unknown',
            status: dbIssue.status,
            category: dbIssue.category?.name || 'Other',
            upvotes: dbIssue.upvotes || dbIssue.votes || 0,
            reportedBy: dbIssue.reportedBy?.name || 'Citizen',
            reportedDate: new Date(dbIssue.createdAt),
            updates: mappedUpdates
          })
        } else {
          // Fallback to mock data if not found in real DB
          setIssue(mockIssueDetails[id] || mockIssueDetails['1'])
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchIssueData()
  }, [id])

  useEffect(() => {
    if (!socket) return
    const handleUpdate = (updatedIssue: any) => {
      if (updatedIssue._id === id || updatedIssue.id === id) {
        fetchIssueData()
      }
    }
    socket.on('issueUpdated', handleUpdate)
    return () => {
      socket.off('issueUpdated', handleUpdate)
    }
  }, [socket, id])

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!issue) return <div>Issue not found</div>

  const handleUpvote = async () => {
    if (upvoted || upvoteLoading) {
      return
    }

    setUpvoteLoading(true)
    const response = await issuesApi.upvote(id)

    if (response.success && response.data) {
      setIssue((prev: any) => prev ? {
        ...prev,
        upvotes: response.data?.upvotes || response.data?.votes || prev.upvotes,
      } : prev)
      setUpvoted(true)

      const currentUserResponse = await import('@/lib/api').then(({ authApi }) => authApi.getCurrentUser())
      if (currentUserResponse.success && currentUserResponse.data) {
        updateUser(currentUserResponse.data)
      }
    }

    setUpvoteLoading(false)
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
        <Card className="surface-card mb-6 overflow-hidden">
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
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{issue.location}</span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Reported By</p>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{issue.reportedBy}</span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Reported Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {issue.reportedDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">Support</p>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {issue.upvotes}
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
            
            {/* Issue Image — Renders if Cloudinary image exists */}
            {(issue.image || issue.image) && (
              <Card className="surface-card overflow-hidden bg-muted">
                <img 
                  src={issue.image || issue.image} 
                  alt={issue.title} 
                  className="w-full max-h-[400px] object-cover" 
                />
              </Card>
            )}

            {/* Description */}
            <Card className="surface-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{issue.longDescription}</p>
              </CardContent>
            </Card>

            {/* Updates */}
            {issue.updates && issue.updates.length > 0 && (
              <Card className="surface-card">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Updates</h2>
                  <div className="space-y-4">
                    {issue.updates.map((update: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-2 ${idx === issue.updates.length - 1 ? 'bg-primary ring-4 ring-primary/15' : 'bg-border'}`} />
                          {idx < issue.updates.length - 1 && (
                            <div className="w-0.5 h-12 bg-border my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-1">
                            {update.date.toLocaleDateString()} {update.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <p className={`text-sm leading-relaxed rounded-xl border px-4 py-3 ${idx === issue.updates.length - 1 ? 'border-primary/15 bg-primary/5 text-foreground' : 'border-border/70 bg-secondary/60 text-foreground'}`}>{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <CommentSection issueId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <Card className="surface-card">
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full rounded-xl"
                  variant={upvoted ? 'default' : 'outline'}
                  onClick={handleUpvote}
                  disabled={upvoted || upvoteLoading}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {upvoteLoading ? 'Upvoting...' : upvoted ? 'Upvoted' : 'Upvote'}
                </Button>
                <Button className="w-full rounded-xl" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="w-full rounded-xl text-destructive" variant="outline">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </CardContent>
            </Card>

            {/* Related Info */}
            <Card className="surface-card sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">About This Issue</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.14em] mb-1">Category</p>
                    <p className="text-foreground font-medium">{issue.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.14em] mb-1">Status</p>
                    <StatusBadge status={issue.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.14em] mb-1">Total Support</p>
                    <p className="text-foreground font-medium">
                      {issue.upvotes} upvotes
                    </p>
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
