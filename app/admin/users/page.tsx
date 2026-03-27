'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  MoreVertical,
  ShieldCheck,
  Trophy,
  Users,
  Mail,
} from 'lucide-react'

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

const statusVariants: Record<AdminUser['status'], 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  inactive: 'secondary',
  suspended: 'destructive',
}

const statusTone: Record<AdminUser['status'], string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border-slate-200 bg-slate-100 text-slate-700',
  suspended: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>(
    'all'
  )

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Community administration
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Users management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review community participation, account activity, and contribution levels from one
            consistent administrative workspace.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-card rounded-2xl p-4">
            <Users className="mb-2 h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Users</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{mockUsers.length}</p>
          </div>
          <div className="surface-card rounded-2xl p-4">
            <ShieldCheck className="mb-2 h-4 w-4 text-emerald-600" />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {mockUsers.filter((user) => user.status === 'active').length}
            </p>
          </div>
          <div className="surface-card rounded-2xl p-4">
            <Trophy className="mb-2 h-4 w-4 text-amber-500" />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Avg Points</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {Math.round(
                mockUsers.reduce((sum, user) => sum + user.points, 0) / mockUsers.length
              )}
            </p>
          </div>
        </div>
      </div>

      <Card className="surface-card rounded-3xl border-border/70">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email"
                className="h-11 rounded-xl border-border/70 bg-background/70 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'inactive', 'suspended'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="rounded-full capitalize"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 ? (
        <Card className="surface-card rounded-3xl border-border/70">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No users found</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try adjusting the search or status filter to view matching community members.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="surface-card hidden rounded-3xl border-border/70 md:block">
            <CardHeader className="border-b border-border/60 pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Users ({filteredUsers.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Community accounts, participation levels, and account status.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                    <tr className="border-b border-border/70 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Joined</th>
                      <th className="px-5 py-4">Reported</th>
                      <th className="px-5 py-4">Points</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border/50 transition-colors hover:bg-slate-50/70 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-slate-50/40'
                        }`}
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                              {user.name
                                .split(' ')
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{user.joinedDate}</td>
                        <td className="px-5 py-4 text-sm font-medium text-foreground">
                          {user.issuesReported}
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                            <Trophy className="h-3.5 w-3.5" />
                            {user.points}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant={statusVariants[user.status]}
                            className={`rounded-full border px-3 py-1 capitalize ${statusTone[user.status]}`}
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button size="sm" variant="ghost" className="rounded-xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="surface-card rounded-3xl border-border/70">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                        {user.name
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-xl">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Joined
                      </p>
                      <p className="mt-1 font-medium text-foreground">{user.joinedDate}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Issues
                      </p>
                      <p className="mt-1 font-medium text-foreground">{user.issuesReported}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Points
                      </p>
                      <p className="mt-1 font-medium text-foreground">{user.points}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant={statusVariants[user.status]}
                        className={`mt-1 rounded-full border px-3 py-1 capitalize ${statusTone[user.status]}`}
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
