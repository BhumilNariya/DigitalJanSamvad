'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, User as UserIcon, AlertTriangle, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { NotificationBell } from '@/components/notification-bell'
import { Brand } from '@/components/brand'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const navLinks = [
    { href: '/issues', label: 'Issues' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/about', label: 'About' },
    { href: '/issue-map', label: 'Issue Map' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="h-[3px] w-full bg-linear-to-r from-primary via-accent to-primary/70" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          <div className="flex-none">
            <Brand compact />
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center gap-7 px-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex flex-none items-center justify-end gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:text-primary"
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <NotificationBell />
                <Button variant="outline" size="sm" className="rounded-full" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2 hidden lg:inline" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button variant="destructive" size="sm" className="rounded-full bg-rose-600 hover:bg-rose-700" asChild>
              <Link href="/sos">
                <AlertTriangle className="w-4 h-4" />
                SOS
              </Link>
            </Button>
            <Button size="sm" className="rounded-full shadow-sm" asChild>
              <Link href="/report">
                Report Issue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-xl border border-border/70 bg-background p-2 text-foreground shadow-sm"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-border pb-5 pt-4">
            <div className="surface-card p-4">
              <div className="flex flex-col gap-3">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <Button variant="outline" className="w-full rounded-xl justify-start" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout ({user.name})
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                )}
                <Button className="w-full rounded-xl" asChild>
                  <Link href="/report">Report Issue</Link>
                </Button>
                <Button variant="destructive" className="w-full rounded-xl bg-rose-600 hover:bg-rose-700" asChild>
                  <Link href="/sos">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    SOS Emergency
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
