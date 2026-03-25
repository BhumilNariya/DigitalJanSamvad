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
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment List */}
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const authorName = (comment.author as any)?.name || 'Unknown'
            return (
              <div key={comment.id} className="flex gap-3 p-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{authorName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{(comment as any).text || comment.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Add Comment */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/20">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
              {user?.name ? initials(user.name) : <User className="w-3 h-3" />}
            </div>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none text-sm"
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
