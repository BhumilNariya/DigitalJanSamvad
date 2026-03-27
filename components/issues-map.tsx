'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft, Filter, Layers, Globe } from 'lucide-react'
import type { IssueStatus } from '@/lib/types'
import { issuesApi, extractIssuesPayload } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import dynamic from 'next/dynamic'

const MapInner = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-emerald-600 font-medium">Loading map...</div>,
})

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

type FilterStatus = 'all' | 'pending' | 'verified' | 'assigned' | 'in-progress' | 'resolved' | 'closed' | 'rejected'

export function IssuesMap() {
  const [filter, setFilter] = useState<FilterStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [mapView, setMapView] = useState<'street' | 'satellite'>('street')
  const [issuesData, setIssuesData] = useState<MapIssue[]>([])
  const socket = useSocket()

  const categories = useMemo(() => {
    const cats = new Set(issuesData.map((issue) => issue.category))
    return Array.from(cats)
  }, [issuesData])

  useEffect(() => {
    const fetchIssues = async () => {
      const res = await issuesApi.getAll({ limit: 500 })
      if (res.success && res.data) {
        const payload = extractIssuesPayload(res.data)
        const formatted = payload.issues.map((issue: any) => ({
          id: issue._id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          category: issue.category?.name || 'Other',
          categoryIcon: issue.category?.icon || 'map-pin',
          lat: issue.latitude || 0,
          lng: issue.longitude || 0,
          image: issue.imageUrl,
          reporter: issue.reportedBy?.name || 'Citizen',
          votes: issue.votes || 0,
          createdAt: new Date(issue.createdAt).toLocaleDateString(),
          location: issue.location || 'Unknown',
        }))

        console.log('Issues State:', formatted)
        setIssuesData(formatted)
      }
    }

    fetchIssues()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('newIssue', (issue: any) => {
      const newMapIssue = {
        id: issue._id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        category: issue.category?.name || 'Other',
        categoryIcon: issue.category?.icon || 'map-pin',
        lat: issue.latitude || 0,
        lng: issue.longitude || 0,
        image: issue.imageUrl,
        reporter: issue.reportedBy?.name || 'Citizen',
        votes: issue.votes || 0,
        createdAt: new Date(issue.createdAt).toLocaleDateString(),
        location: issue.location || 'Unknown',
      }

      setIssuesData((prev) => [newMapIssue, ...prev])
    })

    socket.on('issueUpdated', (updatedIssue: any) => {
      setIssuesData((prev) =>
        prev.map((issue) =>
          issue.id === updatedIssue._id
            ? {
                ...issue,
                status: updatedIssue.status,
                category: updatedIssue.category?.name || issue.category,
                categoryIcon: updatedIssue.category?.icon || issue.categoryIcon,
                lat: updatedIssue.latitude || issue.lat,
                lng: updatedIssue.longitude || issue.lng,
                image: updatedIssue.imageUrl || issue.image,
                location: updatedIssue.location || issue.location,
              }
            : issue,
        ),
      )
    })

    return () => {
      socket.off('newIssue')
      socket.off('issueUpdated')
    }
  }, [socket])

  const filteredIssues = useMemo(() => {
    return issuesData.filter((issue) => {
      const normalizedStatus = String(issue.status).replace('in progress', 'in-progress')
      const statusMatch = filter === 'all' || normalizedStatus === filter
      const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter
      return statusMatch && categoryMatch
    })
  }, [issuesData, filter, categoryFilter])

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-start mb-6 -ml-4">
        <Button variant="outline" asChild className="gap-2 rounded-full px-5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
          <Link href="/issues">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border-[4px] border-emerald-100">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-3 tracking-tight">Civic Issues Map</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Explore civic issues across your region. Click markers for details, apply filters, and switch between map views.
        </p>
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-3 relative p-1 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 w-full mb-3 px-1">
          <div className="bg-white rounded-full shadow-sm border border-slate-200 flex items-center p-1.5 gap-2 pr-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 px-3 text-emerald-600 border-r border-slate-100 font-semibold text-sm">
              <Filter className="w-4 h-4" /> Filters
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterStatus)}
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-full shadow-sm border border-slate-200 flex items-center p-1.5 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-1.5 px-3 text-emerald-600 font-semibold text-sm mr-2">
              <Layers className="w-4 h-4" /> View
            </div>

            <div className="flex bg-slate-100 rounded-full p-0.5">
              <button
                onClick={() => setMapView('street')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  mapView === 'street' ? 'bg-emerald-500 text-white font-medium shadow-sm' : 'text-slate-600 hover:text-slate-800 font-medium'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Street
              </button>
              <button
                onClick={() => setMapView('satellite')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  mapView === 'satellite' ? 'bg-emerald-500 text-white font-medium shadow-sm' : 'text-slate-600 hover:text-slate-800 font-medium'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Satellite
              </button>
            </div>
          </div>
        </div>

        <div className="w-full relative shadow-lg rounded-2xl overflow-hidden ring-1 ring-emerald-50">
          <div className="w-full h-[500px] md:h-[600px] bg-emerald-50" style={{ zIndex: 1 }}>
            <MapInner issues={filteredIssues} mapView={mapView} />
          </div>
        </div>

        <div className="absolute -bottom-4 left-1/2 justify-center transform -translate-x-1/2 z-20 pointer-events-none w-full flex">
          <div className="bg-white border border-slate-200/80 shadow-sm px-6 py-2 rounded-full flex items-center gap-2 text-sm text-slate-500 pointer-events-auto backdrop-blur-md bg-white/90">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Showing <span className="font-bold text-slate-800">{filteredIssues.length}</span> of <span className="font-bold text-slate-800">{issuesData.length}</span> issues
          </div>
        </div>
      </div>

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
