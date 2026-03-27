'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, User } from 'lucide-react'
import { commentApi } from '@/lib/api'
import type { Comment } from '@/lib/types'

interface CommentSectionProps {
  issueId: string
}

export function CommentSection({ issueId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const res = await commentApi.getByIssue(issueId)
      if (res.success && res.data) setComments(res.data)
      setIsLoading(false)
    }
    load()
  }, [issueId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsSubmitting(true)
    const res = await commentApi.create(issueId, newComment.trim())
    if (res.success && res.data) {
      setComments(prev => [...prev, res.data!])
      setNewComment('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    setIsSubmitting(false)
  }

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const timeAgo = (date: string) => {
    const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (secs < 60) return 'just now'
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return `${Math.floor(secs / 86400)}d ago`
  }

  return (
    <div className="surface-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-secondary/70">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment List */}
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-sm">No comments yet. Start the discussion for this civic issue.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const authorName = (comment.author as any)?.name || 'Unknown'
            return (
              <div key={comment.id} className="flex gap-3 p-5">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/15 to-accent/15 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 ring-1 ring-primary/10">
                  {initials(authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{authorName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed rounded-2xl bg-secondary/70 px-4 py-3 border border-border/60">{(comment as any).text || comment.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Add Comment */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="p-5 border-t border-border bg-secondary/40">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/15 to-accent/15 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ring-1 ring-primary/10">
              {user?.name ? initials(user.name) : <User className="w-3 h-3" />}
            </div>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none text-sm rounded-xl bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Press Enter to submit</p>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
          <a href="/login" className="text-primary hover:underline font-medium">Sign in</a> to leave a comment
        </div>
      )}
    </div>
  )
}
