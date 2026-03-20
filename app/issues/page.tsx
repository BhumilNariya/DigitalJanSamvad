'use client'

import { useState, useMemo, useEffect } from 'react'
import { issuesApi, categoryApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IssueCard, type Issue } from '@/components/issue-card'
import { Search, Filter, MapPin } from 'lucide-react'

const statuses = ['All', 'Open', 'In Progress', 'Resolved']

export default function IssuesPage() {
  const [issuesData, setIssuesData] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const socket = useSocket()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'oldest'>('trending')

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await categoryApi.getAll();
      if (catRes.success && catRes.data) {
        setCategories(['All', ...catRes.data.map((c: any) => c.name)]);
      }

      const res = await issuesApi.getAll();
      if (res.success && res.data) {
        const formatted = res.data.map((issue: any) => ({
          id: issue._id,
          title: issue.title,
          description: issue.description,
          location: issue.location?.address || 'Unknown',
          status: issue.status === 'in-progress' ? 'in-progress' : (issue.status === 'resolved' ? 'resolved' : 'open'),
          category: issue.category?.name || 'Other',
          upvotes: 0,
          comments: 0,
          createdAt: issue.createdAt || new Date()
        }));
        setIssuesData(formatted);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('newIssue', (issue: any) => {
      const formatted = {
          id: issue._id,
          title: issue.title,
          description: issue.description,
          location: issue.location?.address || 'Unknown',
          status: issue.status === 'in-progress' ? 'in-progress' : (issue.status === 'resolved' ? 'resolved' : 'open'),
          category: issue.category?.name || 'Other',
          upvotes: 0,
          comments: 0,
          createdAt: issue.createdAt || new Date()
      };
      setIssuesData(prev => [formatted, ...prev]);
    });
    
    socket.on('issueUpdated', (updatedIssue: any) => {
      setIssuesData(prev => prev.map(iss => iss.id === updatedIssue._id ? {
          ...iss, 
          status: updatedIssue.status === 'in-progress' ? 'in-progress' : (updatedIssue.status === 'resolved' ? 'resolved' : 'open'),
          category: updatedIssue.category?.name || iss.category
      } : iss));
    });

    return () => {
      socket.off('newIssue');
      socket.off('issueUpdated');
    };
  }, [socket]);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = [...issuesData].filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'All' || issue.category === selectedCategory

      const normalizedIssueStatus = issue.status === 'in-progress' ? 'in progress' : issue.status;
      const matchesStatus =
        selectedStatus === 'All' ||
        normalizedIssueStatus === selectedStatus.toLowerCase().replace('-', ' ')

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'trending') {
        return b.upvotes - a.upvotes
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
    })

    return filtered
  }, [issuesData, searchQuery, selectedCategory, selectedStatus, sortBy])

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
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    onClick={() => setSelectedCategory(cat)}
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
                    onClick={() => setSelectedStatus(status)}
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
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Issues Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredAndSortedIssues.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No issues found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedStatus('All')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedIssues.length} of {issuesData.length} issues
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
