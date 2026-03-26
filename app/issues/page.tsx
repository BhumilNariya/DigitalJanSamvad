'use client'

import { useState, useEffect, useCallback } from 'react'
import { issuesApi, categoryApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IssueCard } from '@/components/issue-card'
import { Search, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const statuses = ['All', 'Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected']

export default function IssuesPage() {
  const [issuesData, setIssuesData] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const socket = useSocket()
  
  // Pagination & Filtering State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('') // For debouncing / manual submit
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'oldest'>('trending')
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalIssues, setTotalIssues] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch Categories once
  useEffect(() => {
    categoryApi.getAll().then(res => {
      if (res.success && res.data) {
        setCategories(['All', ...res.data.map((c: any) => c.name)])
      }
    })
  }, [])

  // Fetch Issues from API whenever filters or pagination change
  const fetchIssues = useCallback(async () => {
    setLoading(true)
    const params: any = { page, limit: 12, sortByDesc: sortBy }
    
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory
    if (selectedStatus && selectedStatus !== 'All') {
      params.status = selectedStatus.toLowerCase().replace(' ', '-')
    }
    if (searchQuery) params.search = searchQuery

    const res = await issuesApi.getAll(params)
    if (res.success && res.data) {
      const formatted = (res.data.issues || []).map((issue: any) => ({
        id: issue._id,
        title: issue.title,
        description: issue.description,
        location: issue.location?.address || issue.location || 'Unknown',
        status: issue.status || 'pending',
        category: issue.category?.name || 'Other',
        upvotes: issue.upvotes || issue.votes || 0,
        imageUrl: issue.imageUrl,
        comments: issue.comments || 0,
        createdAt: issue.createdAt || new Date()
      }))
      setIssuesData(formatted)
      setTotalPages(res.data.totalPages || 1)
      setTotalIssues(res.data.totalIssues || formatted.length)
      setPage(res.data.currentPage || 1)
    }
    setLoading(false)
  }, [page, selectedCategory, selectedStatus, searchQuery, sortBy])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  // Handle Search Input Enter
  const handleSearchSubmit = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return
    setPage(1)
    setSearchQuery(searchInput)
  }

  // Socket sync logic: Update visible array
  useEffect(() => {
    if (!socket) return
    
    const handleNewIssue = (issue: any) => {
      // Only inject if we are on page 1 and sorting by newest trending
      if (page === 1) fetchIssues()
    }
    
    const handleUpdate = (updatedIssue: any) => {
      setIssuesData(prev => prev.map(iss => iss.id === updatedIssue._id ? {
        ...iss, 
        status: updatedIssue.status,
        category: updatedIssue.category?.name || iss.category
      } : iss))
    }

    socket.on('newIssue', handleNewIssue)
    socket.on('issueUpdated', handleUpdate)

    return () => {
      socket.off('newIssue', handleNewIssue)
      socket.off('issueUpdated', handleUpdate)
    }
  }, [socket, page, fetchIssues])

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Community Issues</h1>
          <p className="text-muted-foreground text-lg">
            Browse and track issues being reported and resolved in your community
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or description..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>
            <Button onClick={() => handleSearchSubmit()}>Search</Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    onClick={() => { setSelectedStatus(status); setPage(1); }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                className="w-full h-9 px-3 border border-border rounded-md bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
              >
                <option value="trending">Trending (Most Votes)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Issues Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Loading community issues...</p>
          </div>
        ) : issuesData.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No issues found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchInput('')
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedStatus('All')
                setPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground font-medium">
                Showing {issuesData.length > 0 ? (page - 1) * 12 + 1 : 0} - {Math.min(page * 12, totalIssues)} of {totalIssues} issues
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issuesData.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-sm font-medium px-4 text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
