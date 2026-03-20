'use client'

import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Users, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Issues', value: '2,847', icon: AlertCircle, change: '+12%' },
    { label: 'Resolved', value: '1,203', icon: CheckCircle2, change: '+8%' },
    { label: 'In Progress', value: '642', icon: Clock, change: '+15%' },
    { label: 'Active Users', value: '892', icon: Users, change: '+5%' },
  ]

  const recentActivity = [
    { type: 'issue', message: 'New issue reported: Pothole on Main Street', time: '5 minutes ago' },
    { type: 'user', message: 'User Sarah Johnson reached 2,450 points', time: '23 minutes ago' },
    { type: 'issue', message: 'Issue #142 status changed to Resolved', time: '1 hour ago' },
    { type: 'user', message: 'New user registration: John Smith', time: '2 hours ago' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your community platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  <p className="text-xs text-primary mt-2">{stat.change}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </h2>
              <CardDescription>Latest events from your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader>
              <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/admin/issues"
                className="block p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
              >
                Review Pending Issues
              </a>
              <a
                href="/admin/users"
                className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium"
              >
                Manage Users
              </a>
              <a
                href="/admin/settings"
                className="block p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium"
              >
                System Settings
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
