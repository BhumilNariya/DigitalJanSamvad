'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Menu, X, LogOut, User as UserIcon, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { NotificationBell } from '@/components/notification-bell'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-none flex justify-start nav-left">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:inline">Digital Jan Samvad</span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex flex-1 flex-wrap items-center justify-center gap-[28px] nav-center px-4">
            <Link href="/issues" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">
              Issues
            </Link>
            <Link href="/leaderboard" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">
              Leaderboard
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">
              About
            </Link>
            <Link href="/issue-map" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">
              Issue Map
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex flex-none items-center justify-end gap-4 nav-right">
            {isAuthenticated && user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 mr-1 text-sm font-medium hover:text-primary transition-colors">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="username whitespace-nowrap">{user.name}</span>
                </Link>
                <NotificationBell />
                <Button variant="outline" size="sm" onClick={logout} className="whitespace-nowrap">
                  <LogOut className="w-4 h-4 mr-2 hidden lg:inline" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild className="whitespace-nowrap">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
            <Button variant="destructive" asChild className="font-bold flex gap-1.5 items-center bg-red-600 hover:bg-red-700">
              <Link href="/sos">
                <AlertTriangle className="w-4 h-4" />
                SOS
              </Link>
            </Button>
            <Button asChild>
              <Link href="/report">Report Issue</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border pb-4">
            <div className="flex flex-col gap-4 pt-4">
              <Link href="/issues" className="text-foreground hover:text-primary transition-colors">
                Issues
              </Link>
              <Link href="/leaderboard" className="text-foreground hover:text-primary transition-colors">
                Leaderboard
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/issue-map" className="text-foreground hover:text-primary transition-colors">
                Issue Map
              </Link>
              <div className="flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <Button variant="outline" onClick={logout} className="w-full">
                    Logout ({user.name})
                  </Button>
                ) : (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                )}
                <Button asChild className="w-full">
                  <Link href="/report">Report Issue</Link>
                </Button>
                <Button variant="destructive" asChild className="w-full font-bold flex gap-2 items-center bg-red-600 hover:bg-red-700">
                  <Link href="/sos">
                    <AlertTriangle className="w-4 h-4" />
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
