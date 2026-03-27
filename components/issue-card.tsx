'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import type { IssueStatus } from '@/lib/types'
import { MessageCircle, MapPin, TrendingUp, Image as ImageIcon, AlertTriangle, Clock3 } from 'lucide-react'

// Extended interface to support Mongoose backend (image, _id) or mock data
export interface Issue {
  id?: string
  _id?: string
  title: string
  description: string
  location: string | { address: string }
  status: IssueStatus | string
  category: string | { name: string }
  upvotes: number
  comments?: number
  imageUrl?: string
  [key: string]: any
}

interface IssueCardProps {
  issue: Issue
}

// ─── Subcomponents ────────────────────────────────────────────────────────

const IssueHeader = ({ title, status }: { title: string; status: any }) => (
  <div className="flex justify-between items-start gap-3 mb-3">
    <h3 className="font-semibold text-foreground line-clamp-2 flex-1 leading-tight text-lg tracking-tight">{title}</h3>
    <div className="shrink-0 mt-0.5">
      <StatusBadge status={status} />
    </div>
  </div>
)

const IssueDescription = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
    {text}
  </p>
)

const IssueLocation = ({ location }: { location: string }) => (
  <div className="flex items-center gap-1.5 text-sm text-foreground/80 mb-3 font-medium">
    <MapPin className="w-4 h-4 text-primary shrink-0" />
    <span className="truncate">{location}</span>
  </div>
)

const IssueCategory = ({ name }: { name: string }) => (
  <div className="mb-4">
    <span className="inline-flex text-[11px] font-semibold tracking-wide uppercase bg-secondary rounded-full px-2.5 py-1 text-secondary-foreground border border-border/50">
      {name}
    </span>
  </div>
)

const IssueMeta = ({ createdAt, priority }: { createdAt?: any; priority?: string }) => {
  const timeAgo = (() => {
    if (!createdAt) return 'Recently added'
    const secs = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
    if (Number.isNaN(secs)) return 'Recently added'
    if (secs < 3600) return `${Math.max(1, Math.floor(secs / 60))} mins ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)} hrs ago`
    return `${Math.floor(secs / 86400)} days ago`
  })()

  return (
    <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" />
        {timeAgo}
      </span>
      {priority === 'high' && (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 ring-1 ring-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" />
          High Priority
        </span>
      )}
    </div>
  )
}

const IssueStats = ({ upvotes, comments }: { upvotes: number; comments?: number }) => (
  <div className="flex gap-4 text-sm text-muted-foreground pt-3 border-t border-border mt-auto">
    <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
      <TrendingUp className="w-4 h-4" />
      <span className="font-medium">{upvotes || 0}</span>
    </div>
    <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
      <MessageCircle className="w-4 h-4" />
      <span className="font-medium">{typeof comments === 'number' ? comments : 0}</span>
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────

export function IssueCard({ issue }: IssueCardProps) {
  const issueId = issue._id || issue.id
  // Handle backend populated location object vs plain string
  const locStr = typeof issue.location === 'object' ? issue.location.address : issue.location
  // Handle backend populated category vs string
  const catStr = typeof issue.category === 'object' ? issue.category.name : issue.category
  // Only treat non-empty, non-whitespace strings as valid image URLs
  const imageUrl = issue.imageUrl?.trim() || ''
  const [imgError, setImgError] = useState(false)
  const isHighPriority = issue.priority === 'high'

  return (
    <Link href={`/issues/${issueId}`}>
      <Card className={`surface-card cursor-pointer h-full flex flex-col group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${isHighPriority ? 'border-rose-200/80' : 'hover:border-primary/30'}`}>

        {/* Image or placeholder */}
        {imageUrl && !imgError ? (
          <div className="aspect-[16/10] overflow-hidden border-b border-border relative bg-muted">
            <img
              src={imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            {isHighPriority && (
              <div className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                High Priority
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[16/10] bg-linear-to-br from-secondary to-muted flex flex-col items-center justify-center border-b border-border">
            <ImageIcon className="w-10 h-10 text-muted-foreground/50 mb-2" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">No Image</span>
          </div>
        )}

        <CardContent className="p-5 flex flex-col grow">
          <IssueHeader title={issue.title} status={issue.status} />

          <IssueDescription text={issue.description} />

          <IssueLocation location={locStr || 'Location not specified'} />

          <IssueMeta createdAt={issue.createdAt} priority={issue.priority} />

          <IssueCategory name={catStr || 'General'} />

          <IssueStats upvotes={issue.upvotes} comments={issue.comments} />
        </CardContent>

      </Card>
    </Link>
  )
}
