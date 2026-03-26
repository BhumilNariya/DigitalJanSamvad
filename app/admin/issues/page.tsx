'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import type { User } from '@/lib/types'
import {
  Search, AlertCircle, CheckCircle2, Zap, ChevronDown,
  Eye, Shield, Wrench, XCircle, Lock, Trash2, Users,
  Filter, RefreshCw, ClipboardList, User as UserIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import dynamic from 'next/dynamic'

// Lazy‑load the heavy detail modal
const IssueDetailModal = dynamic(() => import('@/components/admin/IssueDetailModal'), { ssr: false })

// ─── Status colour map ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:       'bg-red-100 text-red-700 border-red-200',
  verified:      'bg-blue-100 text-blue-700 border-blue-200',
  assigned:      'bg-violet-100 text-violet-700 border-violet-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  resolved:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed:        'bg-slate-100 text-slate-700 border-slate-200',
  rejected:      'bg-rose-100 text-rose-700 border-rose-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending:       'Pending',
  verified:      'Verified',
  assigned:      'Assigned',
  'in-progress': 'In Progress',
  resolved:      'Resolved',
  closed:        'Closed',
  rejected:      'Rejected',
}

// ─── Small reusable status badge ────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// ─── Priority badge ──────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === 'high'   ? 'bg-orange-100 text-orange-700' :
    priority === 'medium' ? 'bg-blue-100 text-blue-700'     :
                            'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${cls}`}>
      {priority || 'medium'}
    </span>
  )
}

// ─── Per‑row actions dropdown ────────────────────────────────────────────────
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
  onStatus:  (id: string, status: string) => void
  onAssign:  (id: string, staffId: string) => void
  onDelete:  (id: string) => void
  onViewDetails: (issue: any) => void
}) {
  const [open, setOpen] = useState(false)
  const s = issue.status || 'pending'
  const busy = updatingId === issue._id

  const close = () => setOpen(false)

  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 shadow-sm"
        onClick={() => setOpen(v => !v)}
        disabled={busy}
      >
        {busy ? <Spinner className="w-4 h-4" /> : <>Actions <ChevronDown className="w-3.5 h-3.5" /></>}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 z-30 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-xl py-1 text-sm animate-in fade-in slide-in-from-top-1">

          {/* View Details */}
          <button
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => { onViewDetails(issue); close() }}
          >
            <Eye className="w-4 h-4 text-slate-500" /> View Details
          </button>

          <div className="border-t border-border my-1" />

          {/* Verify */}
          {s === 'pending' && (
            <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-blue-700 transition-colors"
              onClick={() => { onStatus(issue._id, 'verified'); close() }}>
              <Shield className="w-4 h-4" /> Verify Issue
            </button>
          )}

          {/* Assign staff sub-select */}
          {s !== 'resolved' && s !== 'closed' && s !== 'rejected' && staffUsers.length > 0 && (
            <div className="px-3 py-1.5">
              <select
                className="w-full text-xs h-8 px-2 rounded-md border border-input bg-background"
                onChange={(e) => { if (e.target.value) { onAssign(issue._id, e.target.value); close(); e.target.value = '' } }}
                defaultValue=""
              >
                <option value="" disabled>👤 Assign Staff…</option>
                {staffUsers.map((u: any) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* In Progress */}
          {(s === 'pending' || s === 'verified' || s === 'assigned') && (
            <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-amber-50 text-amber-700 transition-colors"
              onClick={() => { onStatus(issue._id, 'in-progress'); close() }}>
              <Wrench className="w-4 h-4" /> Mark In Progress
            </button>
          )}

          {/* Resolve */}
          {s === 'in-progress' && (
            <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-emerald-50 text-emerald-700 transition-colors"
              onClick={() => { onStatus(issue._id, 'resolved'); close() }}>
              <CheckCircle2 className="w-4 h-4" /> Mark Resolved
            </button>
          )}

          {/* Close */}
          {s === 'resolved' && (
            <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors"
              onClick={() => { onStatus(issue._id, 'closed'); close() }}>
              <Lock className="w-4 h-4" /> Close Issue
            </button>
          )}

          {/* Reject */}
          {s !== 'rejected' && s !== 'closed' && s !== 'resolved' && (
            <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 text-rose-600 transition-colors"
              onClick={() => { onStatus(issue._id, 'rejected'); close() }}>
              <XCircle className="w-4 h-4" /> Reject Report
            </button>
          )}

          <div className="border-t border-border my-1" />

          {/* Notes shortcut */}
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => { onViewDetails(issue); close() }}>
            <ClipboardList className="w-4 h-4 text-slate-500" /> Add Note
          </button>

          {/* Delete */}
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600 transition-colors"
            onClick={() => { onDelete(issue._id); close() }}>
            <Trash2 className="w-4 h-4" /> Delete Report
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminIssuesPage() {
  const [issues, setIssues]         = useState<any[]>([])
  const [users, setUsers]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
  const [totalIssues, setTotalIssues] = useState(0)

  const socket = useSocket()

  // ── Fetch all data ─────────────────────────────────────────────────────────
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

  // ── Real-time socket ───────────────────────────────────────────────────────
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

  // ── Refresh selected issue when list updates ───────────────────────────────
  useEffect(() => {
    if (selectedIssue && issues.length > 0) {
      const updated = issues.find(i => i._id === selectedIssue._id)
      if (updated) setSelectedIssue(updated)
    }
  }, [issues]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    await adminApi.updateIssueStatus(id, status)
    await fetchData()
    setUpdatingId(null)
  }

  const handleAssignStaff = async (issueId: string, staffId: string) => {
    setUpdatingId(issueId)
    await adminApi.assignStaff(issueId, staffId)
    await fetchData()
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

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => issues.filter(issue => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      issue.title?.toLowerCase().includes(q) ||
      issue._id?.toLowerCase().includes(q) ||
      issue.location?.toLowerCase().includes(q) ||
      issue.reportedBy?.name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || issue.status === statusFilter
    return matchSearch && matchStatus
  }), [issues, searchQuery, statusFilter])

  const staffUsers = users.filter(u => u.role === 'staff' || u.role === 'admin')

  // ── Summary counts ─────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    pending:      issues.filter(i => i.status === 'pending').length,
    verified:     issues.filter(i => i.status === 'verified').length,
    assigned:     issues.filter(i => i.status === 'assigned').length,
    'in-progress':issues.filter(i => i.status === 'in-progress').length,
    resolved:     issues.filter(i => i.status === 'resolved').length,
    rejected:     issues.filter(i => i.status === 'rejected').length,
  }), [issues])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Issue Management</h1>
          <p className="text-muted-foreground text-sm">Review, triage and resolve all citizen-reported civic issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Live Updates
            </span>
            <span className="text-xs text-muted-foreground">{totalIssues} total</span>
          </div>
        </div>
      </div>

      {/* ── Status quick-filter pills ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',          label: 'All',         count: totalIssues,          color: 'bg-slate-100 hover:bg-slate-200 text-slate-700' },
          { key: 'pending',      label: 'Pending',     count: counts.pending,       color: 'bg-red-100 hover:bg-red-200 text-red-700' },
          { key: 'verified',     label: 'Verified',    count: counts.verified,      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
          { key: 'assigned',     label: 'Assigned',    count: counts.assigned,      color: 'bg-violet-100 hover:bg-violet-200 text-violet-700' },
          { key: 'in-progress',  label: 'In Progress', count: counts['in-progress'],color: 'bg-amber-100 hover:bg-amber-200 text-amber-700' },
          { key: 'resolved',     label: 'Resolved',    count: counts.resolved,      color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' },
          { key: 'rejected',     label: 'Rejected',    count: counts.rejected,      color: 'bg-rose-100 hover:bg-rose-200 text-rose-700' },
        ].map(pill => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(pill.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              statusFilter === pill.key
                ? 'ring-2 ring-offset-1 ring-primary border-primary/30 ' + pill.color
                : 'border-transparent ' + pill.color
            }`}
          >
            {pill.label}
            <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{pill.count}</span>
          </button>
        ))}
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, title, location or reporter name…"
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {(searchQuery || statusFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all') }}>
            <Filter className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
        <span className="self-center text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} / {totalIssues} issues
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-border text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                <th className="px-5 py-3.5">Report ID</th>
                <th className="px-5 py-3.5 min-w-[220px]">Title &amp; Category</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Date Reported</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && issues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-muted-foreground">
                    <Spinner className="w-6 h-6 mx-auto mb-2 text-primary" />
                    Loading issues…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No issues match your current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(issue => (
                  <tr
                    key={issue._id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${updatingId === issue._id ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {/* Report ID */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleViewDetails(issue)}
                        className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Click to view details"
                      >
                        #{(issue._id || '').slice(-6).toUpperCase()}
                      </button>
                    </td>

                    {/* Title & Category */}
                    <td className="px-5 py-3.5">
                      <button
                        className="font-semibold text-slate-900 dark:text-slate-100 max-w-[240px] truncate block text-left hover:text-primary transition-colors"
                        title={issue.title}
                        onClick={() => handleViewDetails(issue)}
                      >
                        {issue.title}
                      </button>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <span>{issue.category?.icon || '📋'}</span>
                        {issue.category?.name || 'Uncategorized'}
                        {(issue.adminNotes?.length > 0) && (
                          <span className="ml-1 flex items-center gap-0.5 text-indigo-500">
                            <ClipboardList className="w-3 h-3" /> {issue.adminNotes.length}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 max-w-[160px]">
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate block" title={issue.location}>
                        {issue.location || '—'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={issue.priority} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={issue.status || 'pending'} />
                    </td>

                    {/* Assigned To */}
                    <td className="px-5 py-3.5">
                      {issue.assignedTo ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-violet-600">
                          <UserIcon className="w-3.5 h-3.5" /> {issue.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(issue.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
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

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
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
