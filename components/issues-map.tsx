'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, X, ThumbsUp, User, ArrowLeft, Filter, Layers, Globe } from 'lucide-react'
import type { IssueStatus } from '@/lib/types'
import { issuesApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import dynamic from 'next/dynamic'

const MapInner = dynamic(() => import('./map-inner'), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-emerald-600 font-medium">Loading map...</div> })

interface MapIssue {
  id: string
  title: string
  description: string
  status: IssueStatus | 'pending' | 'closed' | 'solved' | 'complete'
  category: string
  categoryIcon: string
  lat: number
  lng: number
  image?: string
  reporter: string
  votes: number
  createdAt: string
  location: string
}

// Definitions removed as category and categoryIcon are dynamically provided by backend.

// Gujarat locations with Indian names
const mockMapIssues: any[] = [
  {
    id: '1',
    title: 'Pothole On Main Road',
    description: "It's a very big pothole near Lal Darwaja causing several accidents. Immediate repair needed.",
    status: 'pending',
    category: 'roads',
    lat: 23.0225,
    lng: 72.5714,
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&h=100&fit=crop',
    reporter: 'Harsh Patel',
    votes: 24,
    createdAt: '2 days ago',
    location: 'Lal Darwaja, Ahmedabad',
  },
  {
    id: '2',
    title: 'Street Light Not Working',
    description: 'Street light has been off for 3 weeks near Sabarmati Ashram Road. Very dangerous at night.',
    status: 'in-progress',
    category: 'electricity',
    lat: 23.0607,
    lng: 72.5802,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    reporter: 'Meera Shah',
    votes: 18,
    createdAt: '1 week ago',
    location: 'Sabarmati, Ahmedabad',
  },
  {
    id: '3',
    title: 'Garbage Overflow at Market',
    description: 'Garbage bins overflowing near Manek Chowk. Bad smell affecting nearby shops and residents.',
    status: 'solved',
    category: 'sanitation',
    lat: 23.0258,
    lng: 72.5873,
    reporter: 'Rajesh Mehta',
    votes: 32,
    createdAt: '3 weeks ago',
    location: 'Manek Chowk, Ahmedabad',
  },
  {
    id: '4',
    title: 'Water Pipeline Leakage',
    description: 'Major water leakage on SG Highway, wasting thousands of liters daily. Urgent attention required.',
    status: 'pending',
    category: 'water',
    lat: 23.0469,
    lng: 72.5175,
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=100&h=100&fit=crop',
    reporter: 'Bhavesh Desai',
    votes: 45,
    createdAt: '5 days ago',
    location: 'SG Highway, Ahmedabad',
  },
  {
    id: '5',
    title: 'Broken Park Bench',
    description: 'Multiple benches broken in Kankaria Lake park. Senior citizens unable to rest during walks.',
    status: 'complete',
    category: 'parks',
    lat: 23.0067,
    lng: 72.6006,
    reporter: 'Anita Joshi',
    votes: 15,
    createdAt: '1 month ago',
    location: 'Kankaria Lake, Ahmedabad',
  },
  {
    id: '6',
    title: 'Open Drainage Cover',
    description: 'Drainage cover missing near CG Road. Very dangerous for pedestrians and two-wheelers.',
    status: 'pending',
    category: 'drainage',
    lat: 23.0350,
    lng: 72.5560,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=100&h=100&fit=crop',
    reporter: 'Vikram Thakkar',
    votes: 38,
    createdAt: '3 days ago',
    location: 'CG Road, Ahmedabad',
  },
  {
    id: '7',
    title: 'No Bus Shelter',
    description: 'Bus stop near Navrangpura has no shelter. Passengers suffer during rain and summer heat.',
    status: 'in-progress',
    category: 'transport',
    lat: 23.0395,
    lng: 72.5567,
    reporter: 'Kavita Rao',
    votes: 22,
    createdAt: '2 weeks ago',
    location: 'Navrangpura, Ahmedabad',
  },
  {
    id: '8',
    title: 'Traffic Signal Malfunction',
    description: 'Traffic signal at Vastrapur junction not working properly causing frequent jams.',
    status: 'solved',
    category: 'public-safety',
    lat: 23.0401,
    lng: 72.5290,
    reporter: 'Dharmesh Prajapati',
    votes: 52,
    createdAt: '10 days ago',
    location: 'Vastrapur, Ahmedabad',
  },
  {
    id: '9',
    title: 'Road Construction Delay',
    description: 'Road work started 6 months ago near Bopal still incomplete. Creating traffic issues daily.',
    status: 'pending',
    category: 'roads',
    lat: 23.0289,
    lng: 72.4658,
    image: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=100&h=100&fit=crop',
    reporter: 'Nilesh Solanki',
    votes: 67,
    createdAt: '1 week ago',
    location: 'Bopal, Ahmedabad',
  },
  {
    id: '10',
    title: 'Frequent Power Cuts',
    description: 'Power cuts happening 4-5 times daily in Chandkheda area. Affecting work from home employees.',
    status: 'in-progress',
    category: 'electricity',
    lat: 23.1088,
    lng: 72.5927,
    reporter: 'Priyanka Chaudhary',
    votes: 89,
    createdAt: '4 days ago',
    location: 'Chandkheda, Ahmedabad',
  },
  {
    id: '11',
    title: 'Illegal Dumping Ground',
    description: 'Construction debris being dumped illegally near Gota. Causing health hazards to residents.',
    status: 'pending',
    category: 'sanitation',
    lat: 23.1012,
    lng: 72.5435,
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=100&h=100&fit=crop',
    reporter: 'Suresh Parmar',
    votes: 41,
    createdAt: '6 days ago',
    location: 'Gota, Ahmedabad',
  },
  {
    id: '12',
    title: 'Low Water Pressure',
    description: 'Water pressure very low in Thaltej area since 2 weeks. Difficult to fill tanks on upper floors.',
    status: 'complete',
    category: 'water',
    lat: 23.0509,
    lng: 72.5006,
    reporter: 'Jignesh Modi',
    votes: 28,
    createdAt: '3 weeks ago',
    location: 'Thaltej, Ahmedabad',
  },
  {
    id: '13',
    title: 'Damaged Children Playground',
    description: 'Swings and slides broken in Law Garden park. Children getting injured while playing.',
    status: 'solved',
    category: 'parks',
    lat: 23.0310,
    lng: 72.5610,
    reporter: 'Hetal Trivedi',
    votes: 35,
    createdAt: '2 weeks ago',
    location: 'Law Garden, Ahmedabad',
  },
  {
    id: '14',
    title: 'Sewage Overflow',
    description: 'Sewage overflowing on road near Satellite area. Creating unhygienic conditions.',
    status: 'pending',
    category: 'drainage',
    lat: 23.0155,
    lng: 72.5230,
    image: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=100&h=100&fit=crop',
    reporter: 'Dipak Bhatt',
    votes: 56,
    createdAt: '2 days ago',
    location: 'Satellite, Ahmedabad',
  },
  {
    id: '15',
    title: 'BRTS Station Broken Escalator',
    description: 'Escalator at Shivranjani BRTS station not working for months. Senior citizens struggling.',
    status: 'in-progress',
    category: 'transport',
    lat: 23.0157,
    lng: 72.5275,
    reporter: 'Ramesh Acharya',
    votes: 31,
    createdAt: '1 week ago',
    location: 'Shivranjani, Ahmedabad',
  },
]

type FilterStatus = 'all' | 'pending' | 'verified' | 'assigned' | 'in-progress' | 'resolved' | 'closed' | 'rejected'

const statusColors: Record<string, string> = {
  pending: '#ef4444',     // Red
  verified: '#3b82f6',    // Blue
  assigned: '#8b5cf6',    // Violet
  'in-progress': '#f59e0b',// Orange
  resolved: '#22c55e',    // Green
  closed: '#6b7280',      // Gray
  rejected: '#000000',    // Black
}

const statusLabels: Record<string, string> = {
  pending: 'PENDING',
  verified: 'VERIFIED',
  assigned: 'ASSIGNED',
  'in-progress': 'IN PROGRESS',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
  rejected: 'REJECTED',
}

export function IssuesMap() {
  const [filter, setFilter] = useState<FilterStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [mapView, setMapView] = useState<'street' | 'satellite'>('street')
  const [issuesData, setIssuesData] = useState<MapIssue[]>([])
  const socket = useSocket()

  // Get unique categories for dropdown
  const categories = useMemo(() => {
    const cats = new Set(issuesData.map(i => i.category))
    return Array.from(cats)
  }, [issuesData])
  
  useEffect(() => {
    const fetchIssues = async () => {
      // Map fetches all since it needs to plot all (or use a large limit)
      const res = await issuesApi.getAll({ limit: 500 });
      if (res.success && res.data && res.data.issues) {
        const formatted = res.data.issues.map((issue: any) => ({
          id: issue._id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          category: issue.category?.name || 'Other',
          categoryIcon: issue.category?.icon || '📋',
          lat: issue.location?.latitude || 0,
          lng: issue.location?.longitude || 0,
          image: issue.image,
          reporter: issue.reportedBy?.name,
          votes: 0,
          createdAt: new Date(issue.createdAt).toLocaleDateString(),
          location: issue.location?.address || 'Unknown'
        }));
        setIssuesData(formatted);
      }
    };
    fetchIssues();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('newIssue', (issue: any) => {
      const newMapIssue = {
          id: issue._id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          category: issue.category?.name || 'Other',
          categoryIcon: issue.category?.icon || '📋',
          lat: issue.location?.latitude || 0,
          lng: issue.location?.longitude || 0,
          image: issue.image,
          reporter: issue.reportedBy?.name,
          votes: 0,
          createdAt: new Date(issue.createdAt).toLocaleDateString(),
          location: issue.location?.address || 'Unknown'
      };
      setIssuesData(prev => [newMapIssue, ...prev]);
    });
    
    socket.on('issueUpdated', (updatedIssue: any) => {
      setIssuesData(prev => prev.map(iss => iss.id === updatedIssue._id ? {
          ...iss, 
          status: updatedIssue.status,
          category: updatedIssue.category?.name || iss.category,
          categoryIcon: updatedIssue.category?.icon || iss.categoryIcon
      } : iss));
    });

    return () => {
      socket.off('newIssue');
      socket.off('issueUpdated');
    };
  }, [socket]);

  const filteredIssues = useMemo(() => {
    return issuesData.filter(issue => {
      // Handle status matching
      let statusMatch = filter === 'all'
      if (!statusMatch) {
         const iStatus = issue.status as string
         // Normalize in-progress string just in case
         const normStatus = iStatus === 'in progress' ? 'in-progress' : iStatus
         statusMatch = normStatus === filter
      }

      // Handle category matching
      const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter

      return statusMatch && categoryMatch
    })
  }, [issuesData, filter, categoryFilter])

  // Map implementations now handled exclusively by MapInner component via React-Leaflet

  return (
    <div className="w-full flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full flex justify-start mb-6 -ml-4">
        <Button variant="outline" asChild className="gap-2 rounded-full px-5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
          <Link href="/issues">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Hero Title */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border-[4px] border-emerald-100">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-3 tracking-tight">Civic Issues Map</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Explore civic issues across your region. Click markers for details, apply filters, and switch between map views.
        </p>
      </div>

      {/* Main Map Container Area */}
      <div className="w-full max-w-5xl mx-auto space-y-3 relative p-1 pb-10">
        
        {/* Top Floating Filters & Triggers */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 w-full mb-3 px-1">
          {/* Filters Block */}
          <div className="bg-white rounded-full shadow-sm border border-slate-200 flex items-center p-1.5 gap-2 pr-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 px-3 text-emerald-600 border-r border-slate-100 font-semibold text-sm">
              <Filter className="w-4 h-4" /> Filters
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 cursor-pointer focus:ring-0 outline-none pr-6"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            <span className="text-slate-300">|</span>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 cursor-pointer focus:ring-0 outline-none pr-6 max-w-[140px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, i) => (
                 <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Map Layer Toggle Block */}
          <div className="bg-white rounded-full shadow-sm border border-slate-200 flex items-center p-1.5 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 px-3 text-emerald-600 font-semibold text-sm mr-2">
              <Layers className="w-4 h-4" /> View
            </div>
            
            <div className="flex bg-slate-100 rounded-full p-0.5">
              <button
                onClick={() => setMapView('street')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  mapView === 'street' 
                    ? 'bg-emerald-500 text-white font-medium shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 font-medium'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Street
              </button>
              <button
                onClick={() => setMapView('satellite')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  mapView === 'satellite' 
                    ? 'bg-emerald-500 text-white font-medium shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 font-medium'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Satellite
              </button>
            </div>
          </div>
        </div>

        {/* Leaflet Map Layer */}
        <div 
          className="w-full relative shadow-lg rounded-2xl overflow-hidden ring-1 ring-emerald-50"
        >
          {/* Inner Map Embed */}
          <div 
            className="w-full h-[500px] md:h-[600px] bg-emerald-50"
            style={{ zIndex: 1 }} // Prevent leaflet popups from overlying sticky nav
          >
            <MapInner issues={filteredIssues} mapView={mapView} />
          </div>
        </div>

        {/* Floating Counter Pill */}
        <div className="absolute -bottom-4 left-1/2 justify-center transform -translate-x-1/2 z-20 pointer-events-none w-full flex">
          <div className="bg-white border border-slate-200/80 shadow-sm px-6 py-2 rounded-full flex items-center gap-2 text-sm text-slate-500 pointer-events-auto backdrop-blur-md bg-white/90">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Showing <span className="font-bold text-slate-800">{filteredIssues.length}</span> of <span className="font-bold text-slate-800">{issuesData.length}</span> issues
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 mb-4 text-sm text-slate-700 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm border border-red-600"></div> Pending
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-violet-500 shadow-sm border border-violet-600"></div> Assigned
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm border border-amber-600"></div> In Progress
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></div> Resolved
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-500 shadow-sm border border-slate-600"></div> Closed
        </div>
      </div>
    </div>
  )
}
