'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Zap,
  ChevronDown,
  Eye,
  Shield,
  Wrench,
  XCircle,
  Lock,
  Trash2,
  Filter,
  RefreshCw,
  ClipboardList,
  User as UserIcon,
  LayoutGrid,
  MapPin,
  CalendarDays,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import dynamic from 'next/dynamic'

const IssueDetailModal = dynamic(() => import('@/components/admin/IssueDetailModal'), { ssr: false })

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  assigned: 'bg-violet-100 text-violet-700 border-violet-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-200 text-slate-800 border-slate-300',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  verified: 'Verified',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
        STATUS_COLORS[status] || STATUS_COLORS.pending
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === 'high'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : priority === 'medium'
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : 'bg-slate-100 text-slate-700 border border-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${cls}`}>
      {priority || 'medium'}
    </span>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-slate-50/40'}>
          <td className="px-5 py-4"><div className="h-8 w-20 animate-pulse rounded-lg bg-muted" /></td>
          <td className="px-5 py-4">
            <div className="space-y-2">
              <div className="h-4 w-44 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-4 w-32 animate-pulse rounded bg-muted" /></td>
          <td className="px-5 py-4"><div className="h-7 w-20 animate-pulse rounded-full bg-muted" /></td>
          <td className="px-5 py-4"><div className="h-7 w-24 animate-pulse rounded-full bg-muted" /></td>
          <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
          <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
          <td className="px-5 py-4 text-right"><div className="ml-auto h-9 w-24 animate-pulse rounded-xl bg-muted" /></td>
        </tr>
      ))}
    </>
  )
}

function ActionsMenu({
  issue,
  staffUsers,
  updatingId,
  onStatus,
  onAssign,
  onDelete,
  onViewDetails,
}: {
  issue: any
  staffUsers: any[]
  updatingId: string | null
  onStatus: (id: string, status: string) => void
  onAssign: (id: string, staffId: string) => void
  onDelete: (id: string) => void
  onViewDetails: (issue: any) => void
}) {
  const [open, setOpen] = useState(false)
  const s = issue.status || 'pending'
  const busy = updatingId === issue._id

  const close = () => setOpen(false)

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1 rounded-xl"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
      >
        {busy ? <Spinner className="h-4 w-4" /> : <>Actions <ChevronDown className="h-3.5 w-3.5" /></>}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-border bg-white py-1 text-sm shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)] animate-in fade-in slide-in-from-top-1 dark:bg-slate-900">
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => {
              onViewDetails(issue)
              close()
            }}
          >
            <Eye className="h-4 w-4 text-slate-500" /> View details
          </button>

          <div className="my-1 border-t border-border" />

          {s === 'pending' && (
            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-blue-700 transition-colors hover:bg-blue-50"
              onClick={() => {
                onStatus(issue._id, 'verified')
                close()
              }}
            >
              <Shield className="h-4 w-4" /> Verify issue
            </button>
          )}

          {s !== 'resolved' && s !== 'closed' && s !== 'rejected' && staffUsers.length > 0 && (
            <div className="px-3 py-1.5">
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                onChange={(e) => {
                  if (e.target.value) {
                    onAssign(issue._id, e.target.value)
                    close()
                    e.target.value = ''
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Assign staff...</option>
                {staffUsers.map((u: any) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          {(s === 'pending' || s === 'verified' || s === 'assigned') && (
            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-amber-700 transition-colors hover:bg-amber-50"
              onClick={() => {
                onStatus(issue._id, 'in-progress')
                close()
              }}
            >
              <Wrench className="h-4 w-4" /> Mark in progress
            </button>
          )}

          {s === 'in-progress' && (
            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-emerald-700 transition-colors hover:bg-emerald-50"
              onClick={() => {
                onStatus(issue._id, 'resolved')
                close()
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> Mark resolved
            </button>
          )}

          {s === 'resolved' && (
            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => {
                onStatus(issue._id, 'closed')
                close()
              }}
            >
              <Lock className="h-4 w-4" /> Close issue
            </button>
          )}

          {s !== 'rejected' && s !== 'closed' && s !== 'resolved' && (
            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-rose-600 transition-colors hover:bg-rose-50"
              onClick={() => {
                onStatus(issue._id, 'rejected')
                close()
              }}
            >
              <XCircle className="h-4 w-4" /> Reject report
            </button>
          )}

          <div className="my-1 border-t border-border" />

          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => {
              onViewDetails(issue)
              close()
            }}
          >
            <ClipboardList className="h-4 w-4 text-slate-500" /> Add note
          </button>

          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
            onClick={() => {
              onDelete(issue._id)
              close()
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete report
          </button>
        </div>
      )}
    </div>
  )
}

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="surface-card rounded-3xl border-border/70 p-5 sm:p-6">{children}</div>
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
  const [totalIssues, setTotalIssues] = useState(0)

  const socket = useSocket()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [issuesRes, usersRes] = await Promise.all([
      adminApi.getIssues({ limit: 100 }),
      adminApi.getUsers(),
    ])
    if (issuesRes.success && issuesRes.data) {
      const payload = issuesRes.data as any
      const list = payload.issues ?? issuesRes.data
      setIssues(Array.isArray(list) ? list : [])
      setTotalIssues(payload.totalIssues ?? list.length)
    }
    if (usersRes.success && usersRes.data) {
      setUsers(usersRes.data as any[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!socket) return
    const refresh = () => fetchData()
    socket.on('newIssue', refresh)
    socket.on('issueUpdated', refresh)
    socket.on('issueDeleted', refresh)
    return () => {
      socket.off('newIssue', refresh)
      socket.off('issueUpdated', refresh)
      socket.off('issueDeleted', refresh)
    }
  }, [socket, fetchData])

  useEffect(() => {
    if (selectedIssue && issues.length > 0) {
      const updated = issues.find((i) => i._id === selectedIssue._id)
      if (updated) setSelectedIssue(updated)
    }
  }, [issues]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    await adminApi.updateIssueStatus(id, status)
    await fetchData()
    setUpdatingId(null)
  }

  const handleAssignStaff = async (issueId: string, staffId: string) => {
    setUpdatingId(issueId)
    console.log('Assigning:', issueId, staffId)
    const response = await adminApi.assignStaff(issueId, staffId)
    if (response.success && response.data) {
      setIssues((prev) => prev.map((issue) => (issue._id === issueId ? response.data : issue)))
      setSelectedIssue((prev: any) => (prev && prev._id === issueId ? response.data : prev))
    } else {
      console.error('Assign failed:', response.error)
      await fetchData()
    }
    setUpdatingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this issue and all its data? This cannot be undone.')) return
    setUpdatingId(id)
    await adminApi.deleteIssue(id)
    await fetchData()
    setUpdatingId(null)
  }

  const handleViewDetails = (issue: any) => setSelectedIssue(issue)

  const filtered = useMemo(() => issues.filter((issue) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      issue.title?.toLowerCase().includes(q) ||
      issue._id?.toLowerCase().includes(q) ||
      issue.location?.toLowerCase().includes(q) ||
      issue.reportedBy?.name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || issue.status === statusFilter
    return matchSearch && matchStatus
  }), [issues, searchQuery, statusFilter])

  const staffUsers = users.filter((u) => u.role === 'staff' || u.role === 'admin')

  const counts = useMemo(() => ({
    pending: issues.filter((i) => i.status === 'pending').length,
    verified: issues.filter((i) => i.status === 'verified').length,
    assigned: issues.filter((i) => i.status === 'assigned').length,
    'in-progress': issues.filter((i) => i.status === 'in-progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    rejected: issues.filter((i) => i.status === 'rejected').length,
  }), [issues])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Operational oversight
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Issue management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review incoming reports, assign staff, and move cases through verification and
            resolution with a cleaner administrative workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Zap className="h-4 w-4" />
              Live updates
            </span>
            <span className="text-xs text-emerald-700/80">{totalIssues} total</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pending', value: counts.pending, icon: AlertCircle, tone: 'text-slate-700 bg-slate-100' },
          { label: 'Verified', value: counts.verified, icon: Shield, tone: 'text-blue-700 bg-blue-100' },
          { label: 'Assigned', value: counts.assigned, icon: UserIcon, tone: 'text-violet-700 bg-violet-100' },
          { label: 'Resolved', value: counts.resolved, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-100' },
        ].map((item) => (
          <div key={item.label} className="surface-card rounded-2xl p-4">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <CardShell>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title, location or reporter name"
              className="h-11 rounded-xl border-border/70 bg-background/70 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: totalIssues, color: 'bg-slate-100 text-slate-700' },
              { key: 'pending', label: 'Pending', count: counts.pending, color: 'bg-slate-100 text-slate-700' },
              { key: 'verified', label: 'Verified', count: counts.verified, color: 'bg-blue-100 text-blue-700' },
              { key: 'assigned', label: 'Assigned', count: counts.assigned, color: 'bg-violet-100 text-violet-700' },
              { key: 'in-progress', label: 'In Progress', count: counts['in-progress'], color: 'bg-amber-100 text-amber-700' },
              { key: 'resolved', label: 'Resolved', count: counts.resolved, color: 'bg-emerald-100 text-emerald-700' },
              { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'bg-rose-100 text-rose-700' },
            ].map((pill) => (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                  statusFilter === pill.key
                    ? 'border-primary/30 ring-2 ring-primary/20 ' + pill.color
                    : 'border-transparent ' + pill.color
                }`}
              >
                {pill.label}
                <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-bold">{pill.count}</span>
              </button>
            ))}
            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
              >
                <Filter className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">{filtered.length} of {totalIssues} issues visible</div>
      </CardShell>

      <div className="hidden overflow-hidden rounded-3xl border border-border/70 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.4)] md:block dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-800/95">
              <tr className="border-b border-border/70 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-4">Report ID</th>
                <th className="px-5 py-4 min-w-[240px]">Title &amp; category</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Assigned to</th>
                <th className="px-5 py-4">Date reported</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && issues.length === 0 ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <LayoutGrid className="h-6 w-6" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">No issues found</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Adjust the search or filter selection to view matching reports.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((issue, index) => (
                  <tr
                    key={issue._id}
                    className={`border-b border-border/50 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-slate-50/35 dark:bg-slate-900/60'
                    } ${updatingId === issue._id ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleViewDetails(issue)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-700 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-300"
                        title="Click to view details"
                      >
                        #{(issue._id || '').slice(-6).toUpperCase()}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="block max-w-[260px] truncate text-left font-semibold text-slate-900 transition-colors hover:text-primary dark:text-slate-100"
                        title={issue.title}
                        onClick={() => handleViewDetails(issue)}
                      >
                        {issue.title}
                      </button>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{issue.category?.icon || '•'}</span>
                        {issue.category?.name || 'Uncategorized'}
                        {issue.internalNotes?.length > 0 && (
                          <span className="ml-1 flex items-center gap-1 text-indigo-500">
                            <ClipboardList className="h-3 w-3" />
                            {issue.internalNotes.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[180px]">
                      <span className="block truncate text-xs text-slate-600 dark:text-slate-400" title={issue.location}>
                        {issue.location || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4"><PriorityBadge priority={issue.priority} /></td>
                    <td className="px-5 py-4"><StatusBadge status={issue.status || 'pending'} /></td>
                    <td className="px-5 py-4">
                      {issue.assignedTo ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700">
                          <UserIcon className="h-3.5 w-3.5" /> {issue.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(issue.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ActionsMenu
                        issue={issue}
                        staffUsers={staffUsers}
                        updatingId={updatingId}
                        onStatus={handleStatusChange}
                        onAssign={handleAssignStaff}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {loading && issues.length === 0 ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="surface-card rounded-3xl p-5">
              <div className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                  <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                </div>
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="surface-card rounded-3xl px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No issues found</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Try another search term or remove a filter to view more reports.
            </p>
          </div>
        ) : (
          filtered.map((issue) => (
            <div
              key={issue._id}
              className={`surface-card rounded-3xl p-5 ${updatingId === issue._id ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    onClick={() => handleViewDetails(issue)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{(issue._id || '').slice(-6).toUpperCase()}
                  </button>
                  <h2 className="mt-3 text-lg font-semibold text-foreground">{issue.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.category?.name || 'Uncategorized'}</p>
                </div>
                <StatusBadge status={issue.status || 'pending'} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </p>
                  <p className="mt-1 font-medium text-foreground">{issue.location || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Reported
                  </p>
                  <p className="mt-1 font-medium text-foreground">{new Date(issue.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Priority</p>
                  <div className="mt-2"><PriorityBadge priority={issue.priority} /></div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Assigned</p>
                  <p className="mt-1 font-medium text-foreground">{issue.assignedTo?.name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <ActionsMenu
                  issue={issue}
                  staffUsers={staffUsers}
                  updatingId={updatingId}
                  onStatus={handleStatusChange}
                  onAssign={handleAssignStaff}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          staffUsers={staffUsers}
          onClose={() => setSelectedIssue(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  )
}
