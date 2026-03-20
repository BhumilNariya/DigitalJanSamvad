'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Issue, CreateIssueData, User } from './types'
import { issuesApi } from './api'

interface IssuesContextType {
  issues: Issue[]
  isLoading: boolean
  error: string | null
  addIssue: (data: CreateIssueData, user: User) => Promise<{ success: boolean; issue?: Issue; error?: string }>
  upvoteIssue: (issueId: string) => Promise<void>
  updateIssueStatus: (issueId: string, status: Issue['status']) => Promise<void>
  refreshIssues: () => Promise<void>
  getIssueById: (id: string) => Issue | undefined
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined)

// Initial mock issues for Gujarat locations
const initialMockIssues: Issue[] = [
  {
    id: 'mock-1',
    title: 'Pothole On Main Road',
    description: "Large pothole near Lal Darwaja causing accidents. Immediate repair needed.",
    category: 'roads',
    status: 'pending',
    location: {
      lat: 23.0225,
      lng: 72.5714,
      address: 'Lal Darwaja, Ahmedabad',
    },
    reportedBy: { id: 'user-1', name: 'Harsh Patel' },
    upvotes: 24,
    comments: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Street Light Not Working',
    description: 'Street light has been off for 3 weeks near Sabarmati Ashram Road. Very dangerous at night.',
    category: 'electricity',
    status: 'in-progress',
    location: {
      lat: 23.0607,
      lng: 72.5802,
      address: 'Sabarmati, Ahmedabad',
    },
    reportedBy: { id: 'user-2', name: 'Meera Shah' },
    upvotes: 18,
    comments: 3,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Garbage Overflow at Market',
    description: 'Garbage bins overflowing near Manek Chowk. Bad smell affecting nearby shops and residents.',
    category: 'sanitation',
    status: 'solved',
    location: {
      lat: 23.0258,
      lng: 72.5873,
      address: 'Manek Chowk, Ahmedabad',
    },
    reportedBy: { id: 'user-3', name: 'Rajesh Mehta' },
    upvotes: 32,
    comments: 8,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-4',
    title: 'Water Pipeline Leakage',
    description: 'Major water leakage on SG Highway, wasting thousands of liters daily. Urgent attention required.',
    category: 'water',
    status: 'pending',
    location: {
      lat: 23.0469,
      lng: 72.5175,
      address: 'SG Highway, Ahmedabad',
    },
    reportedBy: { id: 'user-4', name: 'Bhavesh Desai' },
    upvotes: 45,
    comments: 12,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-5',
    title: 'Broken Park Bench',
    description: 'Multiple benches broken in Kankaria Lake park. Senior citizens unable to rest during walks.',
    category: 'parks',
    status: 'complete',
    location: {
      lat: 23.0067,
      lng: 72.6006,
      address: 'Kankaria Lake, Ahmedabad',
    },
    reportedBy: { id: 'user-5', name: 'Anita Joshi' },
    upvotes: 15,
    comments: 4,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-6',
    title: 'Open Drainage Cover',
    description: 'Drainage cover missing near CG Road. Very dangerous for pedestrians and two-wheelers.',
    category: 'drainage',
    status: 'pending',
    location: {
      lat: 23.0350,
      lng: 72.5560,
      address: 'CG Road, Ahmedabad',
    },
    reportedBy: { id: 'user-6', name: 'Vikram Thakkar' },
    upvotes: 38,
    comments: 7,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-7',
    title: 'No Bus Shelter',
    description: 'Bus stop near Navrangpura has no shelter. Passengers suffer during rain and summer heat.',
    category: 'transport',
    status: 'in-progress',
    location: {
      lat: 23.0395,
      lng: 72.5567,
      address: 'Navrangpura, Ahmedabad',
    },
    reportedBy: { id: 'user-7', name: 'Kavita Rao' },
    upvotes: 22,
    comments: 6,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-8',
    title: 'Traffic Signal Malfunction',
    description: 'Traffic signal at Vastrapur junction not working properly causing frequent jams.',
    category: 'public-safety',
    status: 'solved',
    location: {
      lat: 23.0401,
      lng: 72.5290,
      address: 'Vastrapur, Ahmedabad',
    },
    reportedBy: { id: 'user-8', name: 'Dharmesh Prajapati' },
    upvotes: 52,
    comments: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-9',
    title: 'Road Construction Delay',
    description: 'Road work started 6 months ago near Bopal still incomplete. Creating traffic issues daily.',
    category: 'roads',
    status: 'pending',
    location: {
      lat: 23.0289,
      lng: 72.4658,
      address: 'Bopal, Ahmedabad',
    },
    reportedBy: { id: 'user-9', name: 'Nilesh Solanki' },
    upvotes: 67,
    comments: 20,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-10',
    title: 'Frequent Power Cuts',
    description: 'Power cuts happening 4-5 times daily in Chandkheda area. Affecting work from home employees.',
    category: 'electricity',
    status: 'in-progress',
    location: {
      lat: 23.1088,
      lng: 72.5927,
      address: 'Chandkheda, Ahmedabad',
    },
    reportedBy: { id: 'user-10', name: 'Priyanka Chaudhary' },
    upvotes: 89,
    comments: 25,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Surat issues
  {
    id: 'mock-11',
    title: 'Waterlogging on Ring Road',
    description: 'Heavy waterlogging during monsoon on Ring Road near Adajan. Vehicles getting stuck.',
    category: 'drainage',
    status: 'pending',
    location: {
      lat: 21.1702,
      lng: 72.8311,
      address: 'Ring Road, Adajan, Surat',
    },
    reportedBy: { id: 'user-11', name: 'Ketan Patel' },
    upvotes: 56,
    comments: 18,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Vadodara issues
  {
    id: 'mock-12',
    title: 'Damaged Footpath near Sayaji Garden',
    description: 'Footpath tiles broken near Sayaji Garden main entrance. Senior citizens facing difficulty.',
    category: 'infrastructure',
    status: 'in-progress',
    location: {
      lat: 22.3119,
      lng: 73.1723,
      address: 'Sayaji Garden, Vadodara',
    },
    reportedBy: { id: 'user-12', name: 'Hemant Modi' },
    upvotes: 34,
    comments: 9,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Rajkot issues
  {
    id: 'mock-13',
    title: 'Stray Dogs Issue',
    description: 'Large group of stray dogs near Race Course area. Children afraid to go to school.',
    category: 'public-safety',
    status: 'pending',
    location: {
      lat: 22.2916,
      lng: 70.7932,
      address: 'Race Course, Rajkot',
    },
    reportedBy: { id: 'user-13', name: 'Jayesh Kothari' },
    upvotes: 41,
    comments: 14,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize issues on mount
  useEffect(() => {
    const loadIssues = async () => {
      setIsLoading(true)
      
      // Check if we have stored issues
      const response = await issuesApi.getAll()
      
      if (response.success && response.data && response.data.length > 0) {
        setIssues(response.data)
      } else {
        // Use initial mock issues if no stored issues
        setIssues(initialMockIssues)
        // Store them for persistence
        localStorage.setItem('jansamvad_issues', JSON.stringify(initialMockIssues))
      }
      
      setIsLoading(false)
    }
    
    loadIssues()
  }, [])

  const addIssue = useCallback(async (data: CreateIssueData, user: User) => {
    const response = await issuesApi.create(data, user)
    
    if (response.success && response.data) {
      setIssues(prev => [response.data!, ...prev])
      return { success: true, issue: response.data }
    }
    
    return { success: false, error: response.error }
  }, [])

  const upvoteIssue = useCallback(async (issueId: string) => {
    const response = await issuesApi.upvote(issueId)
    
    if (response.success && response.data) {
      setIssues(prev => 
        prev.map(issue => 
          issue.id === issueId ? response.data! : issue
        )
      )
    }
  }, [])

  const updateIssueStatus = useCallback(async (issueId: string, status: Issue['status']) => {
    const response = await issuesApi.updateStatus(issueId, status)
    
    if (response.success && response.data) {
      setIssues(prev => 
        prev.map(issue => 
          issue.id === issueId ? response.data! : issue
        )
      )
    }
  }, [])

  const refreshIssues = useCallback(async () => {
    setIsLoading(true)
    const response = await issuesApi.getAll()
    
    if (response.success && response.data) {
      setIssues(response.data)
    }
    setIsLoading(false)
  }, [])

  const getIssueById = useCallback((id: string) => {
    return issues.find(issue => issue.id === id)
  }, [issues])

  return (
    <IssuesContext.Provider
      value={{
        issues,
        isLoading,
        error,
        addIssue,
        upvoteIssue,
        updateIssueStatus,
        refreshIssues,
        getIssueById,
      }}
    >
      {children}
    </IssuesContext.Provider>
  )
}

export function useIssues() {
  const context = useContext(IssuesContext)
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssuesProvider')
  }
  return context
}
