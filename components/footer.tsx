'use client'

import Link from 'next/link'
import { Mail, MapPinned, ShieldCheck } from 'lucide-react'
import { Brand } from '@/components/brand'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-linear-to-b from-secondary/70 to-background">
      <div className="h-[2px] w-full bg-linear-to-r from-primary/70 via-accent to-primary/70" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] gap-8 mb-10">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A civic-tech platform for transparent issue reporting, verified follow-up, and stronger community participation.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Community-first and transparency-focused
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/issues" className="text-sm text-muted-foreground transition-colors hover:text-primary">Browse Issues</Link></li>
              <li><Link href="/report" className="text-sm text-muted-foreground transition-colors hover:text-primary">Report Issue</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-muted-foreground transition-colors hover:text-primary">Leaderboard</Link></li>
              <li><Link href="/issue-map" className="text-sm text-muted-foreground transition-colors hover:text-primary">Issue Map</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Information</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About the Platform</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-primary">Citizen Login</Link></li>
              <li><Link href="/register" className="text-sm text-muted-foreground transition-colors hover:text-primary">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Contact & Privacy</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <span>support@digitaljansamvad.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPinned className="mt-0.5 h-4 w-4 text-primary" />
                <span>Built for local civic action in Gujarat</span>
              </div>
              <p className="pt-2 text-xs leading-relaxed">
                Reports, progress updates, and contributor recognition are shown to promote accountability and trust.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Digital Jan Samvad. Built for transparent civic participation.</p>
          <div className="flex gap-4">
            <span>Privacy-first experience</span>
            <span>Accessible on mobile and desktop</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
