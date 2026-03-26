const mongoose = require('mongoose');

const adminNoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  imageUrl: { type: String, default: '' },

  location: String,
  latitude: { type: Number },
  longitude: { type: Number },

  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'pending',
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  votes: { type: Number, default: 0 },
  adminNotes: [adminNoteSchema],
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);
