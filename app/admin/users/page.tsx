'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, MoreVertical } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  joinedDate: string
  issuesReported: number
  points: number
  status: 'active' | 'inactive' | 'suspended'
}

const mockUsers: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@gmail.com',
    joinedDate: '2024-06-15',
    issuesReported: 28,
    points: 2450,
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    joinedDate: '2024-07-20',
    issuesReported: 24,
    points: 2180,
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'Amit Desai',
    email: 'amit.desai@gmail.com',
    joinedDate: '2024-08-10',
    issuesReported: 21,
    points: 1890,
    status: 'inactive',
  },
  {
    id: 'user-4',
    name: 'Neha Mehta',
    email: 'neha.mehta@gmail.com',
    joinedDate: '2024-09-05',
    issuesReported: 18,
    points: 1650,
    status: 'active',
  },
]

const statusColors: Record<AdminUser['status'], "default" | "secondary" | "destructive"> = {
  active: 'default',
  inactive: 'secondary',
  suspended: 'destructive',
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage and monitor community users</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'inactive', 'suspended'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">Users ({filteredUsers.length})</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Issues</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Points</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 text-foreground font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{user.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.joinedDate}</td>
                    <td className="py-3 px-4 text-foreground">{user.issuesReported}</td>
                    <td className="py-3 px-4 text-foreground font-semibold">{user.points}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[user.status]} className="capitalize">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
