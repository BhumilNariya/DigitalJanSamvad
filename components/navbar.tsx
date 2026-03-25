'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Menu, X, LogOut, User as UserIcon } from 'lucide-react'
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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">Samvad</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/issues" className="text-foreground hover:text-primary transition-colors">
              Issues
            </Link>
            <Link href="/leaderboard" className="text-foreground hover:text-primary transition-colors">
              Leaderboard
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 mr-1 text-sm font-medium hover:text-primary transition-colors">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </Link>
                <NotificationBell />
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
