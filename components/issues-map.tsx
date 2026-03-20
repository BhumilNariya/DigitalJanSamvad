'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, X, ThumbsUp, User } from 'lucide-react'
import type { IssueStatus } from './status-badge'
import { issuesApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'

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

type FilterStatus = 'all' | 'pending' | 'in-progress' | 'solved' | 'complete'

const statusColors: Record<string, string> = {
  pending: '#ef4444',
  'in-progress': '#f59e0b',
  solved: '#22c55e',
  complete: '#3b82f6',
  resolved: '#22c55e',
  closed: '#6b7280',
}

const statusLabels: Record<string, string> = {
  pending: 'PENDING',
  'in-progress': 'IN PROGRESS',
  solved: 'SOLVED',
  complete: 'COMPLETE',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
}

export function IssuesMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [issuesData, setIssuesData] = useState<MapIssue[]>([])
  const socket = useSocket()
  
  useEffect(() => {
    const fetchIssues = async () => {
      const res = await issuesApi.getAll();
      if (res.success && res.data) {
        const formatted = res.data.map((issue: any) => ({
          id: issue._id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          category: issue.category?.name || 'Other',
          categoryIcon: issue.category?.icon || '📋',
          lat: issue.location?.latitude || 0,
          lng: issue.location?.longitude || 0,
          image: issue.imageUrl,
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
          image: issue.imageUrl,
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

  const filteredIssues = filter === 'all' 
    ? issuesData 
    : issuesData.filter(issue => {
        if (filter === 'solved') return issue.status === 'solved' || issue.status === 'resolved'
        return issue.status === filter
      })

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Load Leaflet CSS
    const linkElement = document.createElement('link')
    linkElement.rel = 'stylesheet'
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(linkElement)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = (window as any).L

      // Initialize map
      // Center on Ahmedabad, Gujarat
      const map = L.map(mapRef.current).setView([23.0350, 72.5560], 12)
      mapInstanceRef.current = map

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      setIsLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when filter changes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return

    const L = (window as any).L
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker))
    markersRef.current = []

    // Add markers for filtered issues
    filteredIssues.forEach(issue => {
      const color = statusColors[issue.status] || '#ef4444'
      
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([issue.lat, issue.lng], { icon: markerIcon })
        .addTo(map)
        .on('click', () => setSelectedIssue(issue))

      markersRef.current.push(marker)
    })
  }, [filteredIssues, isLoaded])

  // Update popup when selected issue changes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedIssue) return

    const L = (window as any).L
    const map = mapInstanceRef.current

    const popupContent = `
      <div style="min-width: 280px; font-family: system-ui, sans-serif;">
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
          ${selectedIssue.image ? `<img src="${selectedIssue.image}" alt="" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />` : `<span style="font-size: 28px;">${selectedIssue.categoryIcon}</span>`}
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${selectedIssue.title}</h3>
            <span style="font-size: 12px; color: #6b7280;">${selectedIssue.category}</span>
          </div>
        </div>
        <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280; line-height: 1.4;">${selectedIssue.description}</p>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="
            display: inline-block;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 600;
            color: white;
            background-color: ${statusColors[selectedIssue.status]};
            border-radius: 4px;
            text-transform: uppercase;
          ">${statusLabels[selectedIssue.status]}</span>
          <span style="font-size: 13px; color: #9ca3af;">${selectedIssue.createdAt}</span>
        </div>
        <div style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
          📍 ${selectedIssue.location}
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: #6b7280; margin-bottom: 12px;">
          <span>👤 ${selectedIssue.reporter}</span>
          <span>👍 ${selectedIssue.votes} votes</span>
        </div>
        <a href="/issues/${selectedIssue.id}" style="color: #3b82f6; font-size: 14px; font-weight: 500; text-decoration: none;">View Details →</a>
      </div>
    `

    const popup = L.popup()
      .setLatLng([selectedIssue.lat, selectedIssue.lng])
      .setContent(popupContent)
      .openOn(map)

    popup.on('remove', () => setSelectedIssue(null))
  }, [selectedIssue, isLoaded])

  const handleCenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([23.0350, 72.5560], 12)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Community Issues Map</h2>
        <p className="text-muted-foreground">
          Click on markers to view issue details. Issues are color-coded by status.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Show All Issues
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending Only
        </Button>
        <Button
          variant={filter === 'in-progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'solved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('solved')}
        >
          Solved
        </Button>
        <Button
          variant={filter === 'complete' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('complete')}
        >
          Complete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCenterMap}
        >
          <MapPin className="w-4 h-4 mr-1 text-destructive" />
          Center Map
        </Button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg border border-border overflow-hidden bg-muted"
        style={{ zIndex: 1 }}
      />

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
          <span className="text-muted-foreground">Solved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <span className="text-muted-foreground">Complete</span>
        </div>
      </div>
    </div>
  )
}
