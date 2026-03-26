'use client'

import { useEffect, useState, useMemo } from 'react'
import { adminApi, issuesApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import type { Issue, User } from '@/lib/types'
import { MapPin, Search, Filter, AlertCircle, Edit, Trash2, CheckCircle2, MoreVertical, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-red-100 text-red-700 border-red-200',
  assigned: 'bg-violet-100 text-violet-700 border-violet-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const socket = useSocket()

  const fetchData = async () => {
    setLoading(true)
    const [issuesRes, usersRes] = await Promise.all([
      adminApi.getIssues(),
      adminApi.getUsers()
    ])
    
    // The admin route GET /api/admin/issues returns { issues, totalIssues, totalPages, currentPage }
    if (issuesRes.success && issuesRes.data) {
      setIssues((issuesRes.data as any).issues || issuesRes.data)
    }
    if (usersRes.success && usersRes.data) {
      setUsers(usersRes.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!socket) return

    // Realtime integration - seamless injection
    const handleUpdates = () => fetchData()

    socket.on('newIssue', handleUpdates)
    socket.on('issueUpdated', handleUpdates)
    socket.on('issueDeleted', handleUpdates)

    return () => {
      socket.off('newIssue', handleUpdates)
      socket.off('issueUpdated', handleUpdates)
      socket.off('issueDeleted', handleUpdates)
    }
  }, [socket])

  // Admin Actions execution handlers
  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    await issuesApi.updateStatus(id, status)
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
    if (!confirm('Are you sure you want to permanently delete this issue and all connected media/comments?')) return
    setUpdatingId(id)
    await adminApi.deleteIssue(id)
    await fetchData()
    setUpdatingId(null)
  }

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            issue._id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || issue.category?.name === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [issues, searchQuery, statusFilter, categoryFilter])

  const staffUsers = users.filter(u => u.role === 'staff' || u.role === 'admin')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Issue Management</h1>
          <p className="text-muted-foreground">Administer and triage community civic reports securely.</p>
        </div>
        
        {/* Realtime Live Pulse */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2 w-fit">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Live WebSockets
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Report ID or Title..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white border text-sm border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-slate-500 font-medium tracking-wide">
                <th className="px-5 py-4">Report ID</th>
                <th className="px-5 py-4 min-w-[200px]">Title & Category</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status & Assignment</th>
                <th className="px-5 py-4">Reported Date</th>
                <th className="px-5 py-4 text-center">Actions / Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <Spinner className="w-6 h-6 mx-auto mb-2 text-primary" />
                    Loading issues stack...
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    No civic issues match your current filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Report ID */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                        #{issue._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Title & Category */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 max-w-[250px] truncate" title={issue.title}>
                        {issue.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <span>{issue.category?.icon || '📋'}</span>
                        {issue.category?.name || 'Uncategorized'}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                        issue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        issue.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {issue.priority || 'Medium'}
                      </span>
                    </td>

                    {/* Status & Assignment */}
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[issue.status] || STATUS_COLORS.pending}`}>
                        {STATUS_LABELS[issue.status] || issue.status}
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        <UsersIcon className="w-3.5 h-3.5" /> 
                        {issue.assignedTo ? <span className="font-medium text-indigo-600">{issue.assignedTo.name}</span> : 'Unassigned'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(issue.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>

                    {/* Actions Panel */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === issue._id ? (
                          <Spinner className="w-5 h-5 text-primary" />
                        ) : (
                          <>
                            {/* View Full */}
                            <Link href={`/issues/${issue._id}`}>
                              <Button variant="outline" size="sm" className="h-8 shadow-sm">
                                View
                              </Button>
                            </Link>

                            {/* Dropdown Assignment Selector (Native Select for robust functionality) */}
                            {staffUsers.length > 0 && issue.status !== 'resolved' && issue.status !== 'closed' && (
                              <select
                                className="h-8 px-2 text-xs font-medium rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                                onChange={(e) => {
                                  if (e.target.value) handleAssignStaff(issue._id, e.target.value);
                                  e.target.value = ''; // Reset select appearance after action
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>Assign Staff</option>
                                {staffUsers.map(staff => (
                                  <option key={staff._id} value={staff._id}>{staff.name}</option>
                                ))}
                              </select>
                            )}

                            {/* Rapid Action Buttons */}
                            {(issue.status === 'pending' || issue.status === 'assigned') && (
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 shadow-sm bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                onClick={() => handleStatusChange(issue._id, 'in-progress')}
                              >
                                In Progress
                              </Button>
                            )}
                            
                            {issue.status === 'in-progress' && (
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 shadow-sm bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleStatusChange(issue._id, 'resolved')}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Resolve
                              </Button>
                            )}
                            
                            {issue.status === 'resolved' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 shadow-sm text-slate-600 border-slate-300"
                                onClick={() => handleStatusChange(issue._id, 'closed')}
                              >
                                Close Issue
                              </Button>
                            )}

                            {/* Destructive Delete */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(issue._id)}
                              title="Delete Invalid Issue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Inline fallback lucide import placeholder if standard user icon isn't loaded
function UsersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
