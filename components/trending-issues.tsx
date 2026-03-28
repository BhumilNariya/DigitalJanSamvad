'use client'

import { IssueCard, type Issue } from './issue-card'

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'

const cloudinaryImage = (publicId: string) =>
  `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1200/${publicId}`

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
    imageUrl: "https://res.cloudinary.com/dpmynswbb/image/upload/v1774647058/106412830-damaged-asphalt-road-with-potholes-bad-road-road-repair-patch-repair-of-asphalt-bad-asphalt_fxwwgh.jpg",
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
    imageUrl: "https://res.cloudinary.com/dpmynswbb/image/upload/v1774647046/HCevTPDbgAAZ2LM_ukx60h.jpg",
  },
  {
    id: '3',
    title: 'Illegal Encroachment on Footpath',
    description: 'Shop vendors have completely blocked the pedestrian path.',
    location: 'Sardar Patel Garden, Rajkot',
    status: 'resolved',
    category: 'Parks',
    upvotes: 89,
    comments: 12,
    imageUrl: "https://res.cloudinary.com/dpmynswbb/image/upload/v1774647046/Footpath_01_jncgh5.jpg",
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
