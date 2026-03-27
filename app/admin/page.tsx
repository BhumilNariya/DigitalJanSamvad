'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  AlertCircle, CheckCircle2, Clock, Users, Activity,
  TrendingUp, Zap, Shield, Lock, XCircle
} from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS = {
  pending: '#64748b',
  verified: '#2563eb',
  assigned: '#7c3aed',
  'in-progress': '#ea580c',
  resolved: '#16a34a',
  closed: '#334155',
  rejected: '#dc2626',
}

const CHART_COLORS = ['#0f766e', '#2563eb', '#ea580c', '#16a34a', '#7c3aed', '#0ea5e9', '#e11d48']

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const socket = useSocket()

  const fetchStats = async () => {
    const res = await adminApi.getDashboardStats()
    if (res.success && res.data) {
      setStats(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('issueUpdated', fetchStats)
    socket.on('issueDeleted', fetchStats)
    socket.on('newIssue', fetchStats)
    return () => {
      socket.off('issueUpdated', fetchStats)
      socket.off('issueDeleted', fetchStats)
      socket.off('newIssue', fetchStats)
    }
  }, [socket])

  const statCards = stats ? [
    { label: 'Total Issues', value: stats.totalIssues, icon: AlertCircle, color: 'text-foreground bg-muted/50', sub: 'All reports' },
    { label: 'Pending', value: stats.pendingIssues, icon: Clock, color: 'text-slate-700 bg-slate-100', sub: 'Awaiting review' },
    { label: 'Verified', value: stats.verifiedIssues, icon: Shield, color: 'text-blue-600 bg-blue-50', sub: 'Confirmed valid' },
    { label: 'Assigned', value: stats.assignedIssues, icon: Users, color: 'text-violet-600 bg-violet-50', sub: 'With staff' },
    { label: 'In Progress', value: stats.inProgressIssues, icon: TrendingUp, color: 'text-orange-600 bg-orange-50', sub: 'Active work' },
    { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', sub: 'Fixed & done' },
    { label: 'Closed', value: stats.closedIssues, icon: Lock, color: 'text-slate-700 bg-slate-200', sub: 'Final confirm' },
    { label: 'Rejected', value: stats.rejectedIssues, icon: XCircle, color: 'text-rose-600 bg-rose-50', sub: 'Invalid / spam' },
  ] : []

  const pieData = stats ? [
    { name: 'Pending', value: stats.pendingIssues, color: STATUS_COLORS.pending },
    { name: 'Verified', value: stats.verifiedIssues, color: STATUS_COLORS.verified },
    { name: 'Assigned', value: stats.assignedIssues, color: STATUS_COLORS.assigned },
    { name: 'In Progress', value: stats.inProgressIssues, color: STATUS_COLORS['in-progress'] },
    { name: 'Resolved', value: stats.resolvedIssues, color: STATUS_COLORS.resolved },
    { name: 'Closed', value: stats.closedIssues, color: STATUS_COLORS.closed },
    { name: 'Rejected', value: stats.rejectedIssues, color: STATUS_COLORS.rejected },
  ].filter((d) => d.value > 0) : []

  const barData = stats?.categoryBreakdown?.map((c: any, i: number) => ({
    name: c.name || 'Unknown',
    count: c.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })) ?? []

  const recentData = stats?.recentIssues?.map((r: any) => ({
    date: r._id?.slice(5) ?? r._id,
    count: r.count,
  })) ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and respond to civic issue reports</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-sm font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Live Updates
          </span>
          {stats && (
            <span className="text-xs text-muted-foreground">{stats.totalIssues} total</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="surface-card h-24 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="surface-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-foreground leading-tight">{stat.value ?? 0}</p>
                    <p className="text-xs font-medium text-foreground/80 truncate">{stat.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{stat.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="surface-card">
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Issues by Category
              </h2>
              <CardDescription>Distribution of reports across civic categories</CardDescription>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Bar dataKey="count" name="Issues" radius={[6, 6, 0, 0]}>
                      {barData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  No data yet - reports will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card">
          <CardHeader>
            <h2 className="text-lg font-bold">Status Breakdown</h2>
            <CardDescription>Current state of all issues</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="surface-card">
            <CardHeader>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weekly Trend
              </h2>
              <CardDescription>Issues reported in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {recentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={recentData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Reports" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                  No recent data
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card">
          <CardHeader>
            <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/issues" className="block p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium">
              Review Pending Issues
            </Link>
            <Link href="/admin/issues" className="block p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-sm font-medium">
              Verify New Reports
            </Link>
            <Link href="/admin/users" className="block p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium">
              Manage Users
            </Link>
            <Link href="/admin/analytics" className="block p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium">
              Full Analytics
            </Link>
            <Link href="/admin/settings" className="block p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium">
              System Settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
