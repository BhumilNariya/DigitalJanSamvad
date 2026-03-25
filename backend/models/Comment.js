const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
