'use client'

import { useState } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminNote } from '@/lib/types'
import {
  X, MapPin, User, Calendar, Tag, Star, MessageCircle,
  CheckCircle2, Clock, AlertCircle, Shield, Wrench,
  XCircle, Lock, ClipboardList, Send, Loader2, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Status workflow definition ─────────────────────────────────────────────
const WORKFLOW = [
  { key: 'pending',     label: 'Pending',     icon: Clock,        color: 'bg-red-500' },
  { key: 'verified',    label: 'Verified',    icon: Shield,       color: 'bg-blue-500' },
  { key: 'assigned',    label: 'Assigned',    icon: User,         color: 'bg-violet-500' },
  { key: 'in-progress', label: 'In Progress', icon: Wrench,       color: 'bg-amber-500' },
  { key: 'resolved',    label: 'Resolved',    icon: CheckCircle2, color: 'bg-emerald-500' },
  { key: 'closed',      label: 'Closed',      icon: Lock,         color: 'bg-slate-500' },
]

const STATUS_BADGE: Record<string, string> = {
  pending:      'bg-red-100 text-red-700 border-red-200',
  verified:     'bg-blue-100 text-blue-700 border-blue-200',
  assigned:     'bg-violet-100 text-violet-700 border-violet-200',
  'in-progress':'bg-amber-100 text-amber-700 border-amber-200',
  resolved:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed:       'bg-slate-100 text-slate-700 border-slate-200',
  rejected:     'bg-rose-100 text-rose-700 border-rose-200',
}

interface Props {
  issue: any
  staffUsers: any[]
  onClose: () => void
  onRefresh: () => void
}

export default function IssueDetailModal({ issue, staffUsers, onClose, onRefresh }: Props) {
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [assigning, setAssigning] = useState(false)

  const currentStatus = issue.status || 'pending'
  const isRejected = currentStatus === 'rejected'

  // ── Helper: status update ────────────────────────────────────────────────
  const handleStatus = async (status: string) => {
    setUpdatingStatus(true)
    await adminApi.updateIssueStatus(issue._id, status)
    await onRefresh()
    setUpdatingStatus(false)
  }

  // ── Helper: assign staff ─────────────────────────────────────────────────
  const handleAssign = async (staffId: string) => {
    if (!staffId) return
    setAssigning(true)
    await adminApi.assignStaff(issue._id, staffId)
    await onRefresh()
    setAssigning(false)
  }

  // ── Helper: add note ─────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    await adminApi.addAdminNote(issue._id, noteText.trim())
    setNoteText('')
    await onRefresh()
    setAddingNote(false)
  }

  // ── Workflow step index ──────────────────────────────────────────────────
  const currentIdx = WORKFLOW.findIndex(s => s.key === currentStatus)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-semibold">
                #{(issue._id || '').slice(-6).toUpperCase()}
              </span>
              <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${STATUS_BADGE[currentStatus] || STATUS_BADGE.pending}`}>
                {currentStatus.replace('-', ' ')}
              </span>
              <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded ${
                issue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                issue.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {issue.priority || 'medium'} priority
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground truncate">{issue.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">

            {/* ── LEFT: Issue info ──────────────────────────────────────── */}
            <div className="p-6 space-y-5">

              {/* Image */}
              {issue.imageUrl && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Uploaded Image</p>
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    className="w-full max-h-56 object-cover rounded-xl border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{issue.description}</p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Tag className="w-3 h-3"/>Category</p>
                  <p className="text-sm font-semibold">
                    {issue.category?.icon || '📋'} {issue.category?.name || 'Uncategorized'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/>Reported</p>
                  <p className="text-sm font-semibold">
                    {new Date(issue.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Star className="w-3 h-3"/>Votes</p>
                  <p className="text-sm font-semibold">{issue.votes ?? 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3"/>Comments</p>
                  <p className="text-sm font-semibold">{issue.comments ?? 0}</p>
                </div>
              </div>

              {/* Location */}
              {(issue.location || issue.latitude) && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/>Location</p>
                  <p className="text-sm font-semibold">{issue.location || 'Location recorded'}</p>
                  {issue.latitude && issue.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline mt-1 inline-block"
                    >
                      View on Google Maps ↗
                    </a>
                  )}
                </div>
              )}

              {/* Reporter info */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><User className="w-3 h-3"/>Reporter</p>
                <p className="text-sm font-bold">{issue.reportedBy?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{issue.reportedBy?.email || '—'}</p>
                {issue.reportedBy?.mobileNumber && (
                  <p className="text-xs text-muted-foreground">📞 {issue.reportedBy.mobileNumber}</p>
                )}
              </div>

              {/* Assigned to */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Assigned Staff</p>
                <p className="text-sm font-semibold text-violet-600">
                  {issue.assignedTo ? `${issue.assignedTo.name} (${issue.assignedTo.email})` : 'Unassigned'}
                </p>
              </div>
            </div>

            {/* ── RIGHT: Actions + Notes ────────────────────────────────── */}
            <div className="p-6 space-y-6">

              {/* Status Workflow Timeline */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Status Workflow</p>
                <div className="space-y-3">
                  {WORKFLOW.map((step, idx) => {
                    const isActive = step.key === currentStatus
                    const isDone = !isRejected && currentIdx > idx
                    
                    // Match against history array to see when this happened
                    const historyEntry = (issue.statusHistory || []).find((h: any) => h.status === step.key)
                    
                    const StepIcon = step.icon
                    return (
                      <div key={step.key} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isActive ? 'bg-primary/5 border border-primary/20 shadow-sm' :
                        isDone ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'opacity-40'
                      }`}>
                        <div className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive ? step.color : isDone ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}>
                          <StepIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isActive ? 'font-bold text-foreground' : isDone ? 'font-semibold text-emerald-800 dark:text-emerald-400' : 'font-medium text-muted-foreground'}`}>
                              {step.label}
                            </span>
                            {isActive && <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Active</span>}
                            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          </div>
                          
                          {historyEntry && (
                            <div className="mt-1 text-[11px] text-muted-foreground flex flex-col">
                              <span>By: {historyEntry.updatedBy?.name || 'System / Admin'}</span>
                              <span>{new Date(historyEntry.updatedAt).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {isRejected && (
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-rose-50 dark:bg-rose-900/10 border border-rose-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-rose-500">
                        <XCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-rose-700">Rejected</span>
                      <span className="ml-auto text-xs text-rose-500 font-semibold">Current</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {/* Assign staff */}
                  {staffUsers.length > 0 && currentStatus !== 'resolved' && currentStatus !== 'closed' && currentStatus !== 'rejected' && (
                    <div>
                      <select
                        disabled={assigning}
                        className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background shadow-sm focus:ring-2 focus:ring-ring disabled:opacity-60"
                        onChange={(e) => { if (e.target.value) { handleAssign(e.target.value); e.target.value = '' } }}
                        defaultValue=""
                      >
                        <option value="" disabled>👤 Assign to Staff...</option>
                        {staffUsers.map((s: any) => (
                          <option key={s._id} value={s._id}>{s.name} — {s.role}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status transition buttons */}
                  {currentStatus === 'pending' && (
                    <Button disabled={updatingStatus} onClick={() => handleStatus('verified')}
                      className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white">
                      <Shield className="w-4 h-4 mr-2" /> Verify Issue
                    </Button>
                  )}
                  {(currentStatus === 'pending' || currentStatus === 'verified' || currentStatus === 'assigned') && (
                    <Button disabled={updatingStatus} onClick={() => handleStatus('in-progress')}
                      className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-white">
                      <Wrench className="w-4 h-4 mr-2" /> Mark In Progress
                    </Button>
                  )}
                  {currentStatus === 'in-progress' && (
                    <Button disabled={updatingStatus} onClick={() => handleStatus('resolved')}
                      className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Resolved
                    </Button>
                  )}
                  {currentStatus === 'resolved' && (
                    <Button disabled={updatingStatus} variant="outline" onClick={() => handleStatus('closed')}
                      className="w-full h-9 border-slate-300 text-slate-600">
                      <Lock className="w-4 h-4 mr-2" /> Close Issue
                    </Button>
                  )}
                  {currentStatus !== 'rejected' && currentStatus !== 'closed' && currentStatus !== 'resolved' && (
                    <Button disabled={updatingStatus} onClick={() => handleStatus('rejected')}
                      className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white">
                      <XCircle className="w-4 h-4 mr-2" /> Reject Report
                    </Button>
                  )}

                  {updatingStatus && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" /> Internal Notes ({(issue.internalNotes || []).length})
                </p>

                {/* Existing notes */}
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {(issue.internalNotes || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">No internal notes yet.</p>
                  ) : (
                    [...(issue.internalNotes || [])].reverse().map((note: AdminNote) => (
                      <div key={note._id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-foreground">{note.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {note.createdBy?.name || 'Admin'} · {new Date(note.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add note */}
                <div className="flex gap-2">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
                    placeholder="Add internal note... (Enter to submit)"
                    rows={2}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={addingNote || !noteText.trim()}
                    className="px-3 h-auto self-stretch"
                    size="sm"
                  >
                    {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
