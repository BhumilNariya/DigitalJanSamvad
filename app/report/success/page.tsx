'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, Share2, Bell } from 'lucide-react'

export default function ReportSuccessPage() {
  return (
    <div className="w-full">
      {/* Success Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                <CheckCircle2 className="w-20 h-20 text-primary absolute inset-0" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Thank You!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your issue report has been successfully submitted. Our community team will review it
              and take action.
            </p>

            {/* Reference Number */}
            <div className="bg-secondary rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Your Report Reference Number</p>
              <p className="font-mono text-lg font-bold text-foreground">RPT-2026-03-001</p>
              <p className="text-xs text-muted-foreground mt-2">
                Save this number to track your report
              </p>
            </div>

            {/* Next Steps */}
            <div className="space-y-3 mb-8 text-left bg-primary/5 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">What happens next?</h3>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Our team will review your report within 24 hours</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>You'll receive email updates on the status of your report</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>The issue will be assigned to the appropriate department</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>You can track progress on the issue details page</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg" asChild>
                <Link href="/issues">
                  View Your Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link href="/report">Report Another Issue</Link>
              </Button>
            </div>

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Help spread awareness about this issue
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on Social
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
