'use client'

import { IssueCard, type Issue } from './issue-card'

const mockTrendingIssues: Issue[] = [
  {
    id: '1',
    title: 'Pothole on MG Road',
    description: 'Large pothole causing accidents near Lal Darwaja area, immediate repair needed',
    location: 'MG Road, Vadodara',
    status: 'in-progress',
    category: 'Infrastructure',
    upvotes: 248,
    comments: 32,
  },
  {
    id: '2',
    title: 'Street Light Not Working',
    description: 'Multiple street lights not working in residential area, safety concern at night',
    location: 'Varachha Road, Surat',
    status: 'open',
    category: 'Safety',
    upvotes: 156,
    comments: 18,
  },
  {
    id: '3',
    title: 'Public Garden Renovation Complete',
    description: 'Sardar Patel Garden benches and pathways have been successfully repaired',
    location: 'Sardar Patel Garden, Rajkot',
    status: 'resolved',
    category: 'Parks',
    upvotes: 89,
    comments: 12,
  },
]

export default function TrendingIssues() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockTrendingIssues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}
