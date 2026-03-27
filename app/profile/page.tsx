'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { issuesApi, extractIssuesPayload } from '@/lib/api'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle, Clock, CheckCircle2, Hourglass,
  Plus, Search, MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type IssueStatus = 'all' | 'pending' | 'assigned' | 'in-progress' | 'resolved'

export default function CitizenDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [myIssues, setMyIssues] = useState<any[]>([])
  const [communityIssues, setCommunityIssues] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my')
  const [statusFilter, setStatusFilter] = useState<IssueStatus>('all')
  const [search, setSearch] = useState('')
  const [loadingIssues, setLoadingIssues] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchIssues = async () => {
      setLoadingIssues(true)
      const res = await issuesApi.getAll()
      if (res.success && res.data) {
        const payload = extractIssuesPayload(res.data)
        const all = payload.issues as any[]
        console.log('Issues State:', all)
        const mine = user ? all.filter((i: any) =>
          (i.reportedBy?._id || i.reportedBy?.id || i.reportedBy) === (user as any)._id
        ) : []
        setMyIssues(mine)
        setCommunityIssues(all)
      }
      setLoadingIssues(false)
    }
    if (user) fetchIssues()
  }, [user])

  if (isLoading) return null

  const displayList = activeTab === 'my' ? myIssues : communityIssues

  const filtered = displayList.filter((issue: any) => {
    const matchStatus = statusFilter === 'all' || issue.status === statusFilter
    const matchSearch = !search ||
      issue.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.description?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = {
    total: myIssues.length,
    inProgress: myIssues.filter((i: any) => i.status === 'in-progress').length,
    resolved: myIssues.filter((i: any) => i.status === 'resolved').length,
    pending: myIssues.filter((i: any) => i.status === 'pending').length,
  }

  const statusFilters: { label: string; value: IssueStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'pending' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Resolved', value: 'resolved' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citizen Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your reports and community issues</p>
        </div>
        <Button asChild>
          <Link href="/report">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border border-border rounded-lg overflow-hidden mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          My Reports ({myIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-border ${
            activeTab === 'community'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Community Issues ({communityIssues.length})
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reports', value: stats.total, icon: AlertTriangle, color: 'text-muted-foreground bg-muted/50' },
          { label: 'In Progress', value: stats.inProgress, icon: Hourglass, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="border border-border rounded-lg p-4 bg-background flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                statusFilter === value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Issue List */}
      <div className="border border-border rounded-lg bg-background overflow-hidden">
        {loadingIssues ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-base font-medium text-foreground">No reports found</p>
            <p className="text-sm">
              {activeTab === 'my' ? "You haven't submitted any reports yet." : 'No community issues found.'}
            </p>
            {activeTab === 'my' && (
              <Button asChild size="sm" className="mt-2">
                <Link href="/report">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Your First Report
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((issue: any) => (
              <Link
                key={issue._id || issue.id}
                href={`/issues/${issue._id || issue.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Thumbnail Image */}
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                  {issue.imageUrl ? (
                    <img 
                      src={issue.imageUrl} 
                      alt={issue.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">No Img</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{issue.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{issue.location || 'Location not specified'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={issue.status} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
