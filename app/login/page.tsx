'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, User, Shield, MessageSquare, Eye, EyeOff } from 'lucide-react'

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
  const staffDemo   = { email: 'admin@jansamvad.in',  password: 'admin123' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const result = await login({ email, password, type: isStaff ? 'staff' : 'citizen' })
    if (result.success) {
      // Redirect based on role stored in auth context — staff goes to /admin
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

  const isStaff = activeTab === 'staff'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      {/* Brand */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Digital Jan Samvad</span>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to report civic issues</p>
      </div>

      <div className="w-full max-w-md">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 rounded-lg border border-border bg-background p-1 mb-0 shadow-sm">
          <button
            onClick={() => switchTab('citizen')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              !isStaff
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Citizen
          </button>
          <button
            onClick={() => switchTab('staff')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              isStaff
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="w-4 h-4" />
            Government Staff
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-background border border-border rounded-b-lg rounded-tr-lg shadow-lg p-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className={`p-2 rounded-lg ${isStaff ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
              {isStaff ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {isStaff ? 'Government Staff Login' : 'Citizen Login'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isStaff ? 'Access the administrative dashboard' : 'Access your civic reporting dashboard'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {isStaff ? 'Official Email' : 'Email'}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={isStaff ? 'staff@gov.in' : 'test@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full ${isStaff ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Spinner className="mr-2 h-4 w-4" />Signing in...</>
              ) : (
                isStaff ? 'Sign In as Staff' : 'Sign In'
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground">
                <span className="bg-background px-2">Demo Access:</span>
              </div>
            </div>

            {/* Demo Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full font-medium"
              onClick={() => handleDemoLogin(activeTab)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Spinner className="mr-2 h-4 w-4" />Signing in...</>
              ) : isStaff ? (
                'Quick Demo as Rajesh Kumar'
              ) : (
                'Quick Demo as Citizen'
              )}
            </Button>
          </form>

          {!isStaff && (
            <div className="mt-5 text-center text-sm">
              <span className="text-muted-foreground">{"Don't have an account? "}</span>
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
