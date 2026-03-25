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
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const pendingIssues = await Issue.countDocuments({ status: 'pending' });
    const inProgressIssues = await Issue.countDocuments({ status: 'in-progress' });
    const assignedIssues = await Issue.countDocuments({ status: 'assigned' });
    const highPriorityIssues = await Issue.countDocuments({ priority: 'high' });

    // Category breakdown for charts
    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $project: { name: { $arrayElemAt: ['$cat.name', 0] }, count: 1 } },
      { $sort: { count: -1 } }
    ]);

    // Last 7 days issue counts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentIssues = await Issue.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      assignedIssues,
      highPriorityIssues,
      categoryBreakdown,
      recentIssues
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

// @desc    Get all issues (admin view)
// @route   GET /api/admin/issues
// @access  Private/Admin
const getAdminIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue status
// @route   PATCH /api/admin/issues/:id/status
// @access  Private/Admin
const updateIssueStatus = async (req, res) => {
  try {
    const { status, category, priority } = req.body;
    
    const issue = await Issue.findById(req.params.id);

    if (issue) {
      const oldStatus = issue.status;
      
      issue.status = status || issue.status;
      if (category) issue.category = category;
      if (priority) issue.priority = priority;
      
      const updatedIssue = await issue.save();

      // If status changed to resolved, award +20 points
      if (oldStatus !== 'resolved' && updatedIssue.status === 'resolved') {
        const user = await User.findById(issue.reportedBy);
        if (user) {
          user.points += 20;
          await user.save();
          const leaderboard = await User.find({}).sort({ points: -1 }).limit(10).select('name avatar points issuesReported');
          getIo().emit('leaderboardUpdated', leaderboard);
        }
      }

      // Populate for socket emit
      const populatedIssue = await Issue.findById(updatedIssue._id)
        .populate('category', 'name icon')
        .populate('reportedBy', 'name');

      // Create notification for the reporter about status change
      const statusLabels = { pending: 'Pending', assigned: 'Assigned', 'in-progress': 'In Progress', resolved: 'Resolved' };
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
    } else {
      res.status(404).json({ message: 'Issue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getUsers, getAdminIssues, updateIssueStatus };
