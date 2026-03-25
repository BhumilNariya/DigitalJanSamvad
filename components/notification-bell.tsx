'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellDot, CheckCheck, AlertCircle, MessageSquare, UserCheck } from 'lucide-react'
import { notificationApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Notification, NotificationType } from '@/lib/types'

const notifIcon = (type: NotificationType) => {
  switch (type) {
    case 'status_change': return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
    case 'new_comment': return <MessageSquare className="w-3.5 h-3.5 text-primary" />
    case 'issue_assigned': return <UserCheck className="w-3.5 h-3.5 text-violet-500" />
    case 'issue_resolved': return <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
    default: return <Bell className="w-3.5 h-3.5 text-muted-foreground" />
  }
}

const timeAgo = (date: string) => {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    const res = await notificationApi.getAll()
    if (res.success && res.data) {
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s as a fallback
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleMarkOne = async (id: string) => {
    await notificationApi.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  if (!isAuthenticated) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <>
              <BellDot className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={handleMarkAllRead}>
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Bell className="w-8 h-8 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id || (notif as any)._id}
                onClick={() => handleMarkOne(notif.id || (notif as any)._id)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                  !notif.isRead ? 'bg-primary/5' : ''
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-muted flex-shrink-0">
                  {notifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!notif.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
