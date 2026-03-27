'use client'

import { useState, useEffect, useCallback } from 'react'
import { issuesApi, categoryApi, extractIssuesPayload } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IssueCard } from '@/components/issue-card'
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

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
      const payload = extractIssuesPayload(res.data)
      const formatted = payload.issues.map((issue: any) => ({
        id: issue._id,
        title: issue.title,
        description: issue.description,
        location: issue.location || 'Unknown',
        status: issue.status || 'pending',
        category: issue.category?.name || 'Other',
        priority: issue.priority || 'medium',
        upvotes: issue.upvotes || issue.votes || 0,
        imageUrl: issue.imageUrl,
        comments: issue.commentsCount || issue.comments || 0,
        createdAt: issue.createdAt || new Date()
      }))
      console.log('Issues State:', formatted)
      setIssuesData(formatted)
      setTotalPages(payload.totalPages)
      setTotalIssues(payload.totalIssues)
      setPage(payload.currentPage)
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
      <section className="border-b border-border bg-linear-to-br from-primary/10 via-background to-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Community Issues</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Browse and track issues being reported and resolved in your community
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="surface-card p-5">
          {/* Search Bar */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or description..."
                className="pl-10 h-11 rounded-xl"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>
            <Button className="h-11 rounded-xl px-5" onClick={() => handleSearchSubmit()}>Search</Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3 block">
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
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3 block">
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
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                className="w-full h-11 px-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="trending">Trending (Most Votes)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Issues Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface-card overflow-hidden">
                <div className="aspect-[16/10] animate-pulse bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : issuesData.length === 0 ? (
          <div className="surface-card text-center py-14 px-6">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4 opacity-70" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No issues found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try broadening your filters or search terms to view more civic reports from the community.
            </p>
            <Button
              variant="outline"
              className="rounded-xl"
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
