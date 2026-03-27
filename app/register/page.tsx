'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Brand } from '@/components/brand'

const gujaratCities = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
  'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Mehsana', 'Bharuch', 'Vapi', 'Porbandar',
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordRequirements = {
    minLength: formData.password.length >= 6,
    hasNumber: /\d/.test(formData.password),
  }

  const isPasswordValid = passwordRequirements.minLength && passwordRequirements.hasNumber

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number')
      return
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters with 1 number')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      location: formData.location ? `${formData.location}, Gujarat` : undefined,
    })

    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Registration failed. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/8 via-background to-secondary/60 px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-start gap-10 lg:grid-cols-[0.9fr_0.8fr]">
          <div className="hidden lg:block pt-8">
            <Brand />
            <div className="mt-8 max-w-xl space-y-5">
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                Join the civic network improving local neighborhoods.
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Create an account to report issues, follow real progress, and build your community reputation through verified civic participation.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="surface-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Report</p>
                <p className="text-sm text-foreground">Submit civic issues with evidence and location context.</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Track</p>
                <p className="text-sm text-foreground">View updates as issues move from verification to resolution.</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Earn</p>
                <p className="text-sm text-foreground">Build badges and points through trusted contributions.</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg justify-self-center">
            <div className="mb-6 text-center lg:hidden">
              <Brand />
              <p className="mt-3 text-sm text-muted-foreground">Create your account and start reporting civic issues.</p>
            </div>

            <Card className="surface-card border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl tracking-tight">Create Account</CardTitle>
                <CardDescription>Fill in your details to join the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name <span className="text-destructive">*</span></label>
                    <Input id="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required autoComplete="name" disabled={isSubmitting} className="h-11 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address <span className="text-destructive">*</span></label>
                    <Input id="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required autoComplete="email" disabled={isSubmitting} className="h-11 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-foreground">Mobile Number <span className="text-destructive">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-xl border border-r-0 border-input bg-secondary px-3 text-sm text-muted-foreground">+91</span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        autoComplete="tel"
                        disabled={isSubmitting}
                        className="h-11 rounded-l-none rounded-r-xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Use a valid 10-digit Indian mobile number.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-semibold text-foreground">City</label>
                    <Select value={formData.location} onValueChange={(value) => handleChange('location', value)} disabled={isSubmitting}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {gujaratCities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Optional, but helps personalize your civic reporting experience.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-foreground">Password <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required autoComplete="new-password" disabled={isSubmitting} className="h-11 rounded-xl pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="rounded-xl border border-border bg-secondary/60 p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`h-3 w-3 ${passwordRequirements.minLength ? 'text-green-600' : 'text-muted-foreground'}`} />
                          <span className={passwordRequirements.minLength ? 'text-green-700' : 'text-muted-foreground'}>At least 6 characters</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`h-3 w-3 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`} />
                          <span className={passwordRequirements.hasNumber ? 'text-green-700' : 'text-muted-foreground'}>Contains a number</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm Password <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required autoComplete="new-password" disabled={isSubmitting} className="h-11 rounded-xl pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? <><Spinner className="mr-2 h-4 w-4" />Creating Account...</> : 'Create Account'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
