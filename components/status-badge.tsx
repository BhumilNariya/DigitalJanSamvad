'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, Clock3, UserCheck, ShieldCheck } from 'lucide-react'
import type { IssueStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: IssueStatus | string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { label: string; icon: any; className: string }> = {
    pending: {
      label: 'Pending',
      icon: Clock3,
      className: 'bg-red-500 text-white hover:bg-red-600',
    },
    open: {
      label: 'Open',
      icon: AlertCircle,
      className: 'bg-red-500 text-white hover:bg-red-600',
    },
    assigned: {
      label: 'Assigned',
      icon: UserCheck,
      className: 'bg-violet-500 text-white hover:bg-violet-600',
    },
    'in-progress': {
      label: 'In Progress',
      icon: Clock,
      className: 'bg-amber-500 text-white hover:bg-amber-600',
    },
    resolved: {
      label: 'Resolved',
      icon: CheckCircle2,
      className: 'bg-emerald-500 text-white hover:bg-emerald-600',
    },
    solved: {
      label: 'Solved',
      icon: ShieldCheck,
      className: 'bg-emerald-500 text-white hover:bg-emerald-600',
    },
    complete: {
      label: 'Complete',
      icon: CheckCircle2,
      className: 'bg-blue-500 text-white hover:bg-blue-600',
    },
    closed: {
      label: 'Closed',
      icon: CheckCircle2,
      className: 'bg-gray-500 text-white hover:bg-gray-600',
    },
  }

  const badgeConfig = config[status?.toLowerCase()] || {
    label: status || 'Unknown',
    icon: AlertCircle,
    className: 'bg-gray-500 text-white hover:bg-gray-600',
  }

  const { label, icon: Icon, className } = badgeConfig

  return (
    <Badge className={`flex items-center gap-1 ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}
