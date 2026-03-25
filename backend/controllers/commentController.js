const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Issue = require('../models/Issue');
const { getIo } = require('../socket/socketServer');

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to an issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const issue = await Issue.findById(req.params.id).populate('reportedBy', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comment = await Comment.create({
      issue: req.params.id,
      author: req.user._id,
      text,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name avatar');

    // Emit socket event for real-time comment
    getIo().emit('newComment', { issueId: req.params.id, comment: populatedComment });

    // Notify the issue reporter if commenter is someone else
    if (issue.reportedBy && issue.reportedBy._id.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: issue.reportedBy._id,
        type: 'new_comment',
        message: `${req.user.name} commented on your issue: "${issue.title}"`,
        issueId: issue._id,
      });

      // Emit targeted notification to the reporter's socket room
      getIo().to(issue.reportedBy._id.toString()).emit('newNotification', notification);
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, addComment };
