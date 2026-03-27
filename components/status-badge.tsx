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
      className: 'border-slate-200 bg-slate-100 text-slate-700',
    },
    open: {
      label: 'Pending',
      icon: AlertCircle,
      className: 'border-slate-200 bg-slate-100 text-slate-700',
    },
    verified: {
      label: 'Verified',
      icon: ShieldCheck,
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    assigned: {
      label: 'Assigned',
      icon: UserCheck,
      className: 'border-violet-200 bg-violet-50 text-violet-700',
    },
    'in-progress': {
      label: 'In Progress',
      icon: Clock,
      className: 'border-orange-200 bg-orange-50 text-orange-700',
    },
    resolved: {
      label: 'Resolved',
      icon: CheckCircle2,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    solved: {
      label: 'Resolved',
      icon: ShieldCheck,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    complete: {
      label: 'Closed',
      icon: CheckCircle2,
      className: 'border-slate-300 bg-slate-200 text-slate-800',
    },
    closed: {
      label: 'Closed',
      icon: CheckCircle2,
      className: 'border-slate-300 bg-slate-200 text-slate-800',
    },
    rejected: {
      label: 'Rejected',
      icon: AlertCircle,
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    },
  }

  const badgeConfig = config[status?.toLowerCase()] || {
    label: status || 'Unknown',
    icon: AlertCircle,
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  }

  const { label, icon: Icon, className } = badgeConfig

  return (
    <Badge className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-none ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}
