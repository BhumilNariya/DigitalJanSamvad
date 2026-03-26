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
  TrendingUp, AlertTriangle, Zap
} from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS = {
  pending: '#ef4444',
  assigned: '#8b5cf6',
  'in-progress': '#f59e0b',
  resolved: '#22c55e',
}

const CHART_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

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
    { label: 'Total', value: stats.totalIssues, icon: AlertCircle, color: 'text-foreground bg-muted/50', change: 'Issues reported' },
    { label: 'Pending', value: stats.pendingIssues, icon: Clock, color: 'text-red-500 bg-red-50 dark:bg-red-900/20', change: 'Need attention' },
    { label: 'Assigned', value: stats.assignedIssues ?? 0, icon: Users, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20', change: 'Being reviewed' },
    { label: 'In Progress', value: stats.inProgressIssues, icon: TrendingUp, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', change: 'Active work' },
    { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', change: 'Successfully done' },
    { label: 'High Priority', value: stats.highPriorityIssues ?? 0, icon: AlertTriangle, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', change: 'Urgent issues' },
  ] : []

  // Pie chart data from real API
  const pieData = stats ? [
    { name: 'Pending', value: stats.pendingIssues, color: STATUS_COLORS.pending },
    { name: 'Assigned', value: stats.assignedIssues ?? 0, color: STATUS_COLORS.assigned },
    { name: 'In Progress', value: stats.inProgressIssues, color: STATUS_COLORS['in-progress'] },
    { name: 'Resolved', value: stats.resolvedIssues, color: STATUS_COLORS.resolved },
  ].filter(d => d.value > 0) : []

  // Category bar chart data
  const barData = stats?.categoryBreakdown?.map((c: any, i: number) => ({
    name: c.name || 'Unknown',
    count: c.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })) ?? []

  // Recent issues line data
  const recentData = stats?.recentIssues?.map((r: any) => ({
    date: r._id?.slice(5) ?? r._id,
    count: r.count,
  })) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and respond to civic issue reports</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Live Updates
          </span>
          {stats && (
            <span className="text-xs text-muted-foreground">{stats.totalIssues} total reports</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
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
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" name="Issues" radius={[4, 4, 0, 0]}>
                      {barData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  No data yet — reports will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Pie Chart */}
        <Card>
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
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
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
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Reports" />
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

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/issues"
              className="block p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
            >
              🔍 Review Pending Issues
            </Link>
            <Link
              href="/admin/users"
              className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium"
            >
              👥 Manage Users
            </Link>
            <Link
              href="/admin/analytics"
              className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium"
            >
              📊 Full Analytics
            </Link>
            <Link
              href="/admin/settings"
              className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium"
            >
              ⚙️ System Settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
