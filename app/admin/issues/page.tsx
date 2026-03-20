'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Eye, CheckCircle2, AlertCircle } from 'lucide-react'

interface AdminIssue {
  id: string
  title: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  reportedBy: string
  upvotes: number
  createdAt: string
}

const mockIssues: AdminIssue[] = [
  {
    id: '1',
    title: 'Pothole on MG Road',
    category: 'Infrastructure',
    status: 'in-progress',
    reportedBy: 'Rajesh Patel',
    upvotes: 248,
    createdAt: '2026-03-10',
  },
  {
    id: '2',
    title: 'Street Light Not Working',
    category: 'Safety',
    status: 'open',
    reportedBy: 'Priya Sharma',
    upvotes: 156,
    createdAt: '2026-03-12',
  },
  {
    id: '3',
    title: 'Public Garden Renovation',
    category: 'Parks',
    status: 'resolved',
    reportedBy: 'Amit Desai',
    upvotes: 89,
    createdAt: '2026-02-28',
  },
]

const statusColors = {
  open: 'destructive',
  'in-progress': 'secondary',
  resolved: 'default',
}

const statusIcons = {
  open: AlertCircle,
  'in-progress': AlertCircle,
  resolved: CheckCircle2,
}

export default function AdminIssuesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            {(['all', 'open', 'in-progress', 'resolved'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">Issues ({filteredIssues.length})</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reported By</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Upvotes</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => {
                  const StatusIcon = statusIcons[issue.status]
                  return (
                    <tr key={issue.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 text-foreground">{issue.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{issue.category}</td>
                      <td className="py-3 px-4">
                        <Badge className="capitalize gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {issue.status === 'in-progress' ? 'In Progress' : issue.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{issue.reportedBy}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">{issue.upvotes}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
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
