'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { AlertCircle, MapPin, Upload } from 'lucide-react'
import { issuesApi, categoryApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function ReportIssuePage() {
  const { user } = useAuth();
  const [categoriesList, setCategoriesList] = useState<{_id: string, name: string}[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    const fetchCats = async () => {
      const res = await categoryApi.getAll();
      if (res.success && res.data) {
        setCategoriesList(res.data);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
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
        alert("You must be logged in to report an issue.");
        router.push('/login');
        return;
    }
    
    setIsSubmitting(true)

    const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
            lat: 23.0225, // Mock coords for now
            lng: 72.5714,
            address: formData.location
        },
        images: photo ? [photo] : []
    }

    const res = await issuesApi.create(issueData, user);
    
    setIsSubmitting(false)
    if (res.success) {
        router.push('/report/success')
    } else {
        alert(res.error || 'Failed to submit report');
    }
  }

  const isFormValid =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.category &&
    formData.location.trim() &&
    formData.email.trim()

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Report an Issue</h1>
          <p className="text-muted-foreground text-lg">
            Help improve your community by reporting local issues. Your report helps city officials
            prioritize and address problems quickly.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Alert */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Your report will help make our community better
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Be specific about the location and provide as much detail as possible to help our
                team address the issue quickly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">Issue Details</h2>
            <CardDescription>
              Please provide detailed information about the issue you're reporting
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Title */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Issue Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  placeholder="e.g., Large pothole on Main Street"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be concise and descriptive about what the issue is
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                >
                  <option value="">Select a category</option>
                  {categoriesList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="location"
                    placeholder="e.g., Main Street and 5th Avenue"
                    className="pl-10"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Include the street name and nearest intersection or landmark
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Detailed Description *
                </label>
                <Textarea
                  name="description"
                  placeholder="Please provide detailed information about the issue, including when you first noticed it and any safety concerns..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The more details you provide, the better we can help
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileChange} 
                  />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium">{photo ? photo.name : 'Upload a photo'}</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB (optional)
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll use this to send updates about your report
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Phone (Optional)
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Section */}
              <div className="border-t border-border pt-6">
                <div className="bg-secondary p-4 rounded-lg mb-4">
                  <p className="text-sm text-foreground">
                    By submitting this report, you agree to our{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
