const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['status_change', 'new_comment', 'issue_assigned', 'issue_resolved'],
    required: true
  },
  message: { type: String, required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Index for fast lookup by recipient
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
