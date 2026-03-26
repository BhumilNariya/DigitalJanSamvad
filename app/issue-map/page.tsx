import { IssuesMap } from '@/components/issues-map'

export const metadata = {
  title: 'Civic Issues Map | Digital Jan Samvad',
  description: 'Interactive map displaying all civic issues reported in the community. Apply filters to explore issues by status and category.',
}

export default function IssueMapPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <IssuesMap />
      </div>
    </main>
  )
}
