// User Types
export interface User {
  _id?: string
  id?: string
  name: string
  email: string
  role?: string
  phone?: string
  mobileNumber?: string
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
  type?: string
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  location?: string
}

// Issue Types
export type IssueStatus =
  | 'pending'
  | 'verified'
  | 'assigned'
  | 'in-progress'
  | 'resolved'
  | 'closed'
  | 'rejected'
  // legacy/compat
  | 'solved'
  | 'complete'
  | 'open'

export type IssuePriority = 'low' | 'medium' | 'high'

export type IssueCategory = string;

export interface IssueLocation {
  lat: number
  lng: number
  address: string
}

// Admin Note (internal note added by admin/staff)
export interface AdminNote {
  _id: string
  text: string
  createdBy?: { _id: string; name: string }
  createdAt: string
}

export interface Issue {
  _id?: string
  id?: string
  title: string
  description: string
  category: any
  status: IssueStatus
  priority: IssuePriority
  location?: any
  latitude?: number
  longitude?: number
  imageUrl?: string
  images?: string[]
  reportedBy: any
  assignedTo?: any
  votes?: number
  upvotes?: number
  comments?: number
  adminNotes?: AdminNote[]
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
export const categoryLabels: Record<string, string> = {
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

export const categoryIcons: Record<string, string> = {
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

// Status metadata — full 7-step workflow
export const statusColors: Record<string, string> = {
  'pending': '#ef4444',
  'verified': '#3b82f6',
  'assigned': '#8b5cf6',
  'in-progress': '#f59e0b',
  'resolved': '#22c55e',
  'closed': '#6b7280',
  'rejected': '#dc2626',
  // legacy compat
  'open': '#ef4444',
  'solved': '#22c55e',
  'complete': '#3b82f6',
}

export const statusLabels: Record<string, string> = {
  'pending': 'Pending',
  'verified': 'Verified',
  'assigned': 'Assigned',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
  'closed': 'Closed',
  'rejected': 'Rejected',
  'open': 'Open',
  'solved': 'Solved',
  'complete': 'Complete',
}
