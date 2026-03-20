'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export type IssueStatus = 'resolved' | 'in-progress' | 'open'

interface StatusBadgeProps {
  status: IssueStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    resolved: {
      label: 'Resolved',
      icon: CheckCircle2,
      className: 'bg-[hsl(from_var(--status-success)_h_s_l)] text-white',
    },
    'in-progress': {
      label: 'In Progress',
      icon: Clock,
      className: 'bg-[hsl(from_var(--status-in-progress)_h_s_l)] text-white',
    },
    open: {
      label: 'Open',
      icon: AlertCircle,
      className: 'bg-[hsl(from_var(--status-warning)_h_s_l)] text-white',
    },
  }

  const { label, icon: Icon, className } = config[status]

  return (
    <Badge className={`flex items-center gap-1 ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}
