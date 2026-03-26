'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Settings, LogOut, Menu, X, AlertCircle, Users, TrendingUp } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Issues', href: '/admin/issues', icon: AlertCircle },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">Digital Jan Samvad Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 hover:bg-primary/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="outline" className="w-full gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 border-b border-border bg-card px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            Welcome, Administrator
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
