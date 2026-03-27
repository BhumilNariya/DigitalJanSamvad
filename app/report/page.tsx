'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, ImagePlus, MapPin, ShieldCheck, UploadCloud } from 'lucide-react'
import { categoryApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import axios from 'axios'

export default function ReportIssuePage() {
  const { user } = useAuth()
  const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDataState, setFormDataState] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
  })

  useEffect(() => {
    const fetchCats = async () => {
      const res = await categoryApi.getAll()
      if (res.success && res.data) {
        setCategoriesList(res.data)
      }
    }
    fetchCats()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormDataState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('You must be logged in to report an issue.')
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('title', formDataState.title)
    formData.append('description', formDataState.description)
    formData.append('category', formDataState.category)
    formData.append('location', formDataState.location)

    if (photo) {
      formData.append('image', photo)
    }

    try {
      await axios.post('http://localhost:5000/api/issues', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jansamvad_token')}`,
        },
      })
      setIsSubmitting(false)
      router.push('/report/success')
    } catch (error: any) {
      setIsSubmitting(false)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create issue'
      alert(errorMsg)
    }
  }

  const isFormValid =
    formDataState.title.trim() &&
    formDataState.description.trim() &&
    formDataState.category &&
    formDataState.location.trim()

  return (
    <div className="w-full">
      <section className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(15,118,110,0.05),transparent)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-16">
          <div className="space-y-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Civic Reporting Portal
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Report civic issues with clarity, location details, and supporting evidence.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Submit actionable reports so municipal teams can verify, assign, and resolve
                problems faster across your area.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Verified workflow',
                  text: 'Every report moves through a clear review and resolution pipeline.',
                },
                {
                  icon: MapPin,
                  title: 'Location accuracy',
                  text: 'Precise address details help teams route issues to the right staff.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Status tracking',
                  text: 'Follow issue progress after submission from your dashboard.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="surface-card rounded-2xl border border-white/70 bg-background/85 p-4 backdrop-blur"
                >
                  <item.icon className="mb-3 h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card subtle-grid rounded-3xl border border-primary/10 bg-background/95 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Submission guidance</h2>
              <div className="space-y-3">
                {[
                  'Write a short, specific title that describes the civic problem clearly.',
                  'Mention street names, nearby landmarks, or junctions for easier field action.',
                  'Upload a recent image when available to help verification.',
                ].map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="surface-card rounded-3xl border-border/70 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
            <CardHeader className="space-y-3 border-b border-border/60 pb-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <AlertCircle className="h-3.5 w-3.5" />
                Structured issue submission
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Issue details
                </h2>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Provide clear information so the report can be verified quickly and routed to
                  the right team without follow-up delays.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Issue title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="title"
                      placeholder="e.g., Large pothole on Station Road"
                      value={formDataState.title}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl border-border/70 bg-background/70"
                    />
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Keep the title concise and focused on the visible civic issue.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="category"
                      aria-label="Issue Category"
                      value={formDataState.category}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-border/70 bg-background/70 px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Select a category</option>
                      {categoriesList.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Choose the category that best matches the reported issue.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        name="location"
                        placeholder="e.g., Station Road near the main market"
                        className="h-11 rounded-xl border-border/70 bg-background/70 pl-10"
                        value={formDataState.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Add road names, landmarks, or the nearest junction for better field routing.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Detailed description <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Describe what happened, when you noticed it, and whether it creates safety or accessibility problems."
                    value={formDataState.description}
                    onChange={handleChange}
                    rows={6}
                    required
                    className="min-h-[150px] rounded-2xl border-border/70 bg-background/70"
                  />
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Mention impact, urgency, and any recurring pattern you have observed.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Photo <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <p className="text-xs leading-5 text-muted-foreground">
                      A recent image helps verification teams understand the issue faster.
                    </p>
                  </div>

                  {photo ? (
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                      <div className="aspect-[16/7] w-full bg-muted">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {photo.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Image attached and ready for submission
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setPhoto(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-primary/[0.03] px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.05]">
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleFileChange}
                      />
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Upload supporting photo</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        PNG or JPG up to 5MB. This step is optional.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-900">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <p>
                      Reports with precise locations and clear descriptions are easier to verify and
                      resolve through the civic workflow.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-muted-foreground">
                    By submitting, you confirm that the issue information is accurate to the best of
                    your knowledge.
                  </p>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="rounded-xl px-6"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit report'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="surface-card rounded-3xl border-border/70">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Helpful evidence</h3>
                    <p className="text-xs text-muted-foreground">Photos and location detail speed up verification.</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Use visible landmarks and exact road references when possible.</p>
                  <p>Report one issue per submission for cleaner routing and tracking.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card rounded-3xl border-border/70">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground">What happens next</h3>
                <div className="mt-4 space-y-3">
                  {['Report received', 'Verification review', 'Staff assignment', 'Progress tracking'].map(
                    (step, index) => (
                      <div key={step} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{step}</p>
                          <p className="text-xs text-muted-foreground">
                            {index === 0 && 'Your issue is recorded in the platform.'}
                            {index === 1 && 'Teams check the report details and evidence.'}
                            {index === 2 && 'The issue is routed to the right municipal staff.'}
                            {index === 3 && 'You can follow updates from your dashboard.'}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
