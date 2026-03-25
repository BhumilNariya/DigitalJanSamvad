// User Types
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  avatar?: string
  points: number
  issuesReported: number
  issuesResolved: number
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  location?: string
}

// Issue Types
export type IssueStatus = 'pending' | 'assigned' | 'in-progress' | 'solved' | 'complete' | 'resolved' | 'open' | 'closed'
export type IssuePriority = 'low' | 'medium' | 'high'

export type IssueCategory = string;

export interface IssueLocation {
  lat: number
  lng: number
  address: string
}

export interface Issue {
  id: string
  title: string
  description: string
  category: IssueCategory
  status: IssueStatus
  priority: IssuePriority
  location: IssueLocation
  images?: string[]
  reportedBy: {
    id: string
    name: string
  }
  upvotes: number
  comments: number
  createdAt: string
  updatedAt: string
}

export interface CreateIssueData {
  title: string
  description: string
  category: IssueCategory
  location: IssueLocation
  images?: (string | File)[]
}

// Comment Types
export interface Comment {
  id: string
  issueId: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  text?: string
  upvotes: number
  createdAt: string
}

// Notification Types
export type NotificationType = 'status_change' | 'new_comment' | 'issue_assigned' | 'issue_resolved'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  issueId?: string
  isRead: boolean
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Category metadata
export const categoryLabels: Record<IssueCategory, string> = {
  'roads': 'Roads & Infrastructure',
  'electricity': 'Electricity',
  'water': 'Water Supply',
  'sanitation': 'Sanitation & Waste',
  'public-safety': 'Public Safety',
  'parks': 'Parks & Gardens',
  'drainage': 'Drainage & Sewage',
  'transport': 'Public Transport',
  'infrastructure': 'Infrastructure',
  'other': 'Other',
}

export const categoryIcons: Record<IssueCategory, string> = {
  'roads': '🛣️',
  'electricity': '💡',
  'water': '💧',
  'sanitation': '🗑️',
  'public-safety': '🚨',
  'parks': '🌳',
  'drainage': '🚰',
  'transport': '🚌',
  'infrastructure': '🏗️',
  'other': '📋',
}

// Status metadata
export const statusColors: Record<IssueStatus, string> = {
  'pending': '#ef4444',
  'open': '#ef4444',
  'assigned': '#8b5cf6',
  'in-progress': '#f59e0b',
  'solved': '#22c55e',
  'resolved': '#22c55e',
  'complete': '#3b82f6',
  'closed': '#6b7280',
}

export const statusLabels: Record<IssueStatus, string> = {
  'pending': 'Pending',
  'open': 'Open',
  'assigned': 'Assigned',
  'in-progress': 'In Progress',
  'solved': 'Solved',
  'resolved': 'Resolved',
  'complete': 'Complete',
  'closed': 'Closed',
}
