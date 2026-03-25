'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Eye, CheckCircle2, AlertCircle, ImageIcon } from 'lucide-react'
import { issuesApi } from '@/lib/api'
import Link from 'next/link'

interface AdminIssue {
  id: string
  title: string
  category: string
  status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed'
  reportedBy: string
  upvotes: number
  image?: string
  createdAt: string
  _id?: string
}

const statusIcons: Record<string, any> = {
  open: AlertCircle,
  pending: AlertCircle,
  'in-progress': AlertCircle,
  resolved: CheckCircle2,
  closed: CheckCircle2,
}

export default function AdminIssuesPage() {
  const [issuesData, setIssuesData] = useState<AdminIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    issuesApi.getAll().then(res => {
      if (res.success && res.data) {
        const formatted = res.data.map((issue: any) => ({
          ...issue,
          id: issue._id,
          category: issue.category?.name || 'Other',
          reportedBy: issue.reportedBy?.name || 'Unknown',
          status: issue.status || 'open'
        }))
        setIssuesData(formatted)
      }
      setLoading(false)
    })
  }, [])

  const filteredIssues = issuesData.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Issues Management</h1>
        <p className="text-muted-foreground">Review and manage all reported issues</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'open', 'pending', 'in-progress', 'resolved'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-foreground">Issues ({filteredIssues.length})</h2>
             {loading && <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-16">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reported By</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Upvotes</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No issues match the current filters</td>
                  </tr>
                )}
                {filteredIssues.map((issue) => {
                  const StatusIcon = statusIcons[issue.status] || AlertCircle
                  return (
                    <tr key={issue.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-2 px-4">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border">
                           {issue.image ? (
                             <img src={issue.image} alt="Thumbnail" className="w-full h-full object-cover" />
                           ) : (
                             <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                           )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium">{issue.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{issue.category}</td>
                      <td className="py-3 px-4">
                        <Badge className="capitalize gap-1" variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                          <StatusIcon className="w-3 h-3" />
                          {issue.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{issue.reportedBy}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">{issue.upvotes || 0}</td>
                      <td className="py-3 px-4">
                        <Link href={`/issues/${issue.id}`}>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Eye className="w-4 h-4" />
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
