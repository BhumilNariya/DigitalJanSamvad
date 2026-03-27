'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, User, Shield, Eye, EyeOff, CircleAlert } from 'lucide-react'
import { Brand } from '@/components/brand'

type TabType = 'citizen' | 'staff'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>('citizen')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const citizenDemo = { email: 'demo@jansamvad.in', password: 'demo123' }
  const staffDemo = { email: 'admin@jansamvad.in', password: 'admin123' }

  const isStaff = activeTab === 'staff'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const result = await login({ email, password, type: isStaff ? 'staff' : 'citizen' })
    if (result.success) {
      const stored = localStorage.getItem('jansamvad_user')
      const role = stored ? JSON.parse(stored).role : null
      router.push(role === 'admin' ? '/admin' : '/profile')
    } else {
      setError(result.error || 'Login failed. Please try again.')
    }
    setIsSubmitting(false)
  }

  const handleDemoLogin = async (type: TabType) => {
    setError('')
    setIsSubmitting(true)
    const creds = type === 'citizen' ? citizenDemo : staffDemo
    setEmail(creds.email)
    setPassword(creds.password)
    const result = await login({ ...creds, type: type === 'staff' ? 'staff' : 'citizen' })
    if (result.success) {
      router.push(type === 'staff' ? '/admin' : '/profile')
    } else {
      setError(result.error || 'Demo login failed.')
    }
    setIsSubmitting(false)
  }

  const switchTab = (tab: TabType) => {
    setActiveTab(tab)
    setEmail('')
    setPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/8 via-background to-secondary/60 px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_0.75fr]">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <Brand />
              <div className="mt-8 space-y-5">
                <h1 className="text-5xl font-bold tracking-tight text-foreground">
                  Trusted civic reporting for citizens and staff.
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Access issue tracking, public transparency, and civic resolution workflows from a single trusted dashboard.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="surface-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Citizen Access</p>
                  <p className="text-sm text-foreground">Report issues, track status, and earn recognition for verified contributions.</p>
                </div>
                <div className="surface-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Staff Flow</p>
                  <p className="text-sm text-foreground">Verify, assign, and resolve civic issues with a focused admin workflow.</p>
                </div>
                <div className="surface-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Trust Signals</p>
                  <p className="text-sm text-foreground">Live updates and public issue states improve visibility and accountability.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-center">
            <div className="mb-6 text-center lg:hidden">
              <Brand compact={false} />
              <p className="mt-3 text-sm text-muted-foreground">Sign in to report, verify, or manage civic issues.</p>
            </div>

            <div className="surface-card overflow-hidden">
              <div className="border-b border-border bg-secondary/60 p-2">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/80 p-1">
                  <button
                    onClick={() => switchTab('citizen')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      !isStaff ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Citizen
                  </button>
                  <button
                    onClick={() => switchTab('staff')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      isStaff ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Government Staff
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="mb-6">
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${isStaff ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                    {isStaff ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {isStaff ? 'Government Staff Login' : 'Citizen Login'}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isStaff ? 'Access the administrative dashboard and response tools.' : 'Access your civic dashboard and issue history.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground">
                      {isStaff ? 'Official Email Address' : 'Email Address'} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={isStaff ? 'staff@gov.in' : 'name@example.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isStaff ? 'Use your authorized staff account.' : 'Use the email linked to your Digital Jan Samvad account.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CircleAlert className="h-3.5 w-3.5" />
                      Password is case-sensitive.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className={`h-11 w-full rounded-xl ${isStaff ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Spinner className="mr-2 h-4 w-4" />Signing in...</>
                    ) : (
                      isStaff ? 'Sign In as Staff' : 'Sign In'
                    )}
                  </Button>

                  <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground">
                      <span className="bg-card px-3 uppercase tracking-[0.14em]">Demo Access</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-xl font-medium"
                    onClick={() => handleDemoLogin(activeTab)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Spinner className="mr-2 h-4 w-4" />Signing in...</>
                    ) : isStaff ? (
                      'Quick Demo as Staff'
                    ) : (
                      'Quick Demo as Citizen'
                    )}
                  </Button>
                </form>

                {!isStaff && (
                  <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">{"Don't have an account? "}</span>
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
