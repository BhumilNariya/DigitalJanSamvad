const User = require('../models/User');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { getIo } = require('../socket/socketServer');

// @desc    Get dashboard stats (users, issues)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIssues = await Issue.countDocuments();

    const [
      pendingIssues,
      verifiedIssues,
      assignedIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      rejectedIssues,
      highPriorityIssues,
    ] = await Promise.all([
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'verified' }),
      Issue.countDocuments({ status: 'assigned' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'closed' }),
      Issue.countDocuments({ status: 'rejected' }),
      Issue.countDocuments({ priority: 'high' }),
    ]);

    // Category breakdown for charts
    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $project: { name: { $arrayElemAt: ['$cat.name', 0] }, count: 1 } },
      { $sort: { count: -1 } },
    ]);

    // Last 7 days issue counts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentIssues = await Issue.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      totalIssues,
      pendingIssues,
      verifiedIssues,
      assignedIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      rejectedIssues,
      highPriorityIssues,
      categoryBreakdown,
      recentIssues,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues (admin view) with pagination + optional status filter
// @route   GET /api/admin/issues?page=1&limit=20&status=pending
// @access  Private/Admin
const getAdminIssues = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const totalIssues = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      issues,
      totalIssues,
      totalPages: Math.ceil(totalIssues / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue by ID (admin view with all fields populated)
// @route   GET /api/admin/issues/:id
// @access  Private/Admin
const getAdminIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.createdBy', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue status (and optionally category / priority)
// @route   PATCH /api/admin/issues/:id/status
// @access  Private/Admin
const updateIssueStatus = async (req, res) => {
  try {
    const { status, category, priority } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const oldStatus = issue.status;

    issue.status = status || issue.status;
    if (category) issue.category = category;
    if (priority) issue.priority = priority;

    const updatedIssue = await issue.save();

    // Award +20 points to reporter when resolved
    if (oldStatus !== 'resolved' && updatedIssue.status === 'resolved') {
      const user = await User.findById(issue.reportedBy);
      if (user) {
        user.points += 20;
        await user.save();
        const leaderboard = await User.find({})
          .sort({ points: -1 })
          .limit(10)
          .select('name avatar points issuesReported');
        getIo().emit('leaderboardUpdated', leaderboard);
      }
    }

    // Populate for socket emit
    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.createdBy', 'name');

    // Notification labels for all 7 workflow statuses
    const statusLabels = {
      pending: 'Pending Review',
      verified: 'Verified',
      assigned: 'Assigned to Staff',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
      rejected: 'Rejected',
    };

    const notification = await Notification.create({
      recipient: issue.reportedBy,
      type: 'status_change',
      message: `Your issue "${issue.title}" status changed to ${statusLabels[updatedIssue.status] || updatedIssue.status}`,
      issueId: issue._id,
    });

    // Emit targeted notification to reporter's room
    getIo().to(issue.reportedBy.toString()).emit('newNotification', notification);
    // Broadcast issue updated to all
    getIo().emit('issueUpdated', populatedIssue);

    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign staff to an issue
// @route   PATCH /api/admin/issues/:id/assign
// @access  Private/Admin
const assignIssue = async (req, res) => {
  try {
    const { staffId } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.assignedTo = staffId;
    // Only auto-advance if still at pending/verified
    if (issue.status === 'pending' || issue.status === 'verified') {
      issue.status = 'assigned';
    }
    const updatedIssue = await issue.save();

    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.createdBy', 'name');

    getIo().emit('issueUpdated', populatedIssue);
    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add an internal admin note to an issue
// @route   PATCH /api/admin/issues/:id/note
// @access  Private/Admin
const addAdminNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.adminNotes.push({
      text: text.trim(),
      createdBy: req.user._id,
      createdAt: new Date(),
    });

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.createdBy', 'name');

    getIo().emit('issueUpdated', populatedIssue);
    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an invalid issue
// @route   DELETE /api/admin/issues/:id
// @access  Private/Admin
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    await issue.deleteOne();
    getIo().emit('issueDeleted', req.params.id);
    res.json({ message: 'Issue removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getAdminIssues,
  getAdminIssueById,
  updateIssueStatus,
  assignIssue,
  addAdminNote,
  deleteIssue,
};
