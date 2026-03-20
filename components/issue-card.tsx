'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge, type IssueStatus } from './status-badge'
import { MessageCircle, MapPin, TrendingUp } from 'lucide-react'

export interface Issue {
  id: string
  title: string
  description: string
  location: string
  status: IssueStatus
  category: string
  upvotes: number
  comments: number
  image?: string
}

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        {issue.image && (
          <div className="h-40 bg-muted overflow-hidden">
            <img
              src={issue.image}
              alt={issue.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{issue.title}</h3>
            <StatusBadge status={issue.status} />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {issue.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {issue.location}
            </div>
            <div className="text-xs bg-secondary rounded-full px-2 py-1 inline-block text-secondary-foreground">
              {issue.category}
            </div>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {issue.upvotes}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {issue.comments}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
