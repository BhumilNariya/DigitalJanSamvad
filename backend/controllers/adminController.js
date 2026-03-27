const User = require('../models/User');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { getIo } = require('../socket/socketServer');
const {
  syncPointWindows,
  awardVerificationPoints,
  awardResolutionPoints,
  formatLeaderboardEntry,
} = require('../utils/gamification');

const emitLeaderboardUpdate = async () => {
  const users = await User.find({}).sort({ points: -1, issuesReported: -1, createdAt: 1 }).limit(10);
  getIo().emit('leaderboardUpdated', users.map((user, index) => formatLeaderboardEntry(user, index + 1)));
};

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
    users.forEach((user) => syncPointWindows(user));
    await Promise.all(users.map((user) => user.save()));
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
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name')
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
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an issue's general details (category, priority, etc)
// @route   PATCH /api/admin/issues/:id
// @access  Private/Admin
const updateIssueDetails = async (req, res) => {
  try {
    const { category, priority } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    if (category) issue.category = category;
    if (priority) issue.priority = priority;

    const updatedIssue = await issue.save();
    
    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

    getIo().emit('issueUpdated', populatedIssue);
    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const _updateStatus = async (req, res, newStatus) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const oldStatus = issue.status;
    let isStatusChanged = false;
    
    if (oldStatus !== newStatus) {
      issue.status = newStatus;
      isStatusChanged = true;
      issue.statusHistory.push({
        status: newStatus,
        updatedBy: req.user._id,
        updatedAt: new Date()
      });
    }

    const updatedIssue = await issue.save();

    if (isStatusChanged) {
      const reporter = await User.findById(issue.reportedBy);
      let rewardsChanged = false;

      if (reporter && updatedIssue.status === 'verified' && oldStatus !== 'verified') {
        rewardsChanged = await awardVerificationPoints(reporter, updatedIssue) || rewardsChanged;
      }

      if (reporter && updatedIssue.status === 'resolved' && oldStatus !== 'resolved') {
        rewardsChanged = await awardResolutionPoints(reporter, updatedIssue) || rewardsChanged;
      }

      if (rewardsChanged) {
        await Promise.all([reporter.save(), updatedIssue.save()]);
        await emitLeaderboardUpdate();
      }
    }

    // Populate for socket emit
    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

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

    if (isStatusChanged) {
      const notification = await Notification.create({
        recipient: issue.reportedBy,
        type: 'status_change',
        message: `Your issue "${issue.title}" status changed to ${statusLabels[updatedIssue.status] || updatedIssue.status}`,
        issueId: issue._id,
      });

      // Emit targeted notification to reporter's room
      getIo().to(issue.reportedBy.toString()).emit('newNotification', notification);
    }
    
    // Broadcast issue updated to all
    getIo().emit('issueUpdated', populatedIssue);

    res.json({ success: true, data: populatedIssue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyIssue = (req, res) => _updateStatus(req, res, 'verified');
const startIssue = (req, res) => _updateStatus(req, res, 'in-progress');
const resolveIssue = (req, res) => _updateStatus(req, res, 'resolved');
const closeIssue = (req, res) => _updateStatus(req, res, 'closed');
const rejectIssue = (req, res) => _updateStatus(req, res, 'rejected');

// @desc    Assign staff to an issue
// @route   PATCH /api/admin/issues/:id/assign
// @route   PUT /api/issues/:id/assign
// @access  Private/Admin
const assignIssue = async (req, res) => {
  try {
    const { staffId } = req.body;
    console.log('[assignIssue] Assigning:', req.params.id, staffId);

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'staffId is required' });
    }

    const staffUser = await User.findById(staffId).select('_id name email role');
    if (!staffUser) {
      return res.status(404).json({ success: false, message: 'Staff user not found' });
    }

    if (staffUser.role !== 'admin' && staffUser.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'Selected user is not staff' });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    issue.assignedTo = staffId;
    const wasAssigned = issue.status === 'assigned' && issue.assignedTo?.toString() === staffId;
    if (!wasAssigned) {
      issue.status = 'assigned';
      issue.statusHistory.push({
        status: 'assigned',
        updatedBy: req.user._id,
        updatedAt: new Date()
      });
    }

    const updatedIssue = await issue.save();
    console.log('[assignIssue] Assigned:', updatedIssue.assignedTo?.toString());

    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

    const notification = await Notification.create({
      recipient: issue.reportedBy,
      type: 'issue_assigned',
      message: `Your issue "${issue.title}" has been assigned to ${staffUser.name}`,
      issueId: issue._id,
    });

    getIo().to(issue.reportedBy.toString()).emit('newNotification', notification);
    getIo().emit('issueUpdated', populatedIssue);
    res.json({ success: true, data: populatedIssue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add an internal note to an issue
// @route   POST /api/admin/issues/:id/note
// @access  Private/Admin
const addInternalNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.internalNotes.push({
      text: text.trim(),
      createdBy: req.user._id,
      createdAt: new Date(),
    });

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

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
  updateIssueDetails,
  verifyIssue,
  startIssue,
  resolveIssue,
  closeIssue,
  rejectIssue,
  assignIssue,
  addInternalNote,
  deleteIssue,
};
