'use client'

import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const issuesTrendData = [
  { month: 'Jan', open: 45, resolved: 38, inProgress: 12 },
  { month: 'Feb', open: 52, resolved: 48, inProgress: 15 },
  { month: 'Mar', open: 48, resolved: 65, inProgress: 20 },
  { month: 'Apr', open: 61, resolved: 72, inProgress: 25 },
  { month: 'May', open: 55, resolved: 85, inProgress: 22 },
  { month: 'Jun', open: 67, resolved: 92, inProgress: 28 },
]

const categoryData = [
  { name: 'Infrastructure', value: 45 },
  { name: 'Safety', value: 25 },
  { name: 'Parks', value: 20 },
  { name: 'Maintenance', value: 10 },
]

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981']

const userGrowthData = [
  { week: 'Week 1', users: 150 },
  { week: 'Week 2', users: 280 },
  { week: 'Week 3', users: 420 },
  { week: 'Week 4', users: 650 },
  { week: 'Week 5', users: 892 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track platform metrics and trends</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues Trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-lg font-bold text-foreground">Issues Trend</h2>
            <CardDescription>Issues reported over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.625rem',
                  }}
                />
                <Legend />
                <Bar dataKey="open" stackId="a" fill="#ef4444" />
                <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" />
                <Bar dataKey="resolved" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-lg font-bold text-foreground">Issues by Category</h2>
            <CardDescription>Distribution of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-bold text-foreground">User Growth</h2>
            <CardDescription>Active user growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.625rem',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
