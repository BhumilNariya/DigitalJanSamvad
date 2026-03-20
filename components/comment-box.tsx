'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle } from 'lucide-react'

export interface Comment {
  id: string
  author: string
  avatar?: string
  content: string
  timestamp: Date
  upvotes: number
}

interface CommentBoxProps {
  comments?: Comment[]
  onAddComment?: (content: string) => void
}

export function CommentBox({ comments = [], onAddComment }: CommentBoxProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      onAddComment?.(newComment)
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </h3>

        {/* New Comment Form */}
        <div className="space-y-3 mb-6">
          <Textarea
            placeholder="Share your thoughts or updates about this issue..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback>{comment.author[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{comment.author}</p>
                    <span className="text-xs text-muted-foreground">
                      {comment.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{comment.content}</p>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    👍 {comment.upvotes}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
