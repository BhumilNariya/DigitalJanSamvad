const User = require('../models/User');
const Issue = require('../models/Issue');
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

    res.json({
      totalUsers,
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues
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
    const { status, category } = req.body;
    
    const issue = await Issue.findById(req.params.id);

    if (issue) {
      const oldStatus = issue.status;
      
      issue.status = status || issue.status;
      if (category) {
          issue.category = category;
      }
      
      const updatedIssue = await issue.save();

      // If status changed to resolved, award points
      if (oldStatus !== 'resolved' && updatedIssue.status === 'resolved') {
        const user = await User.findById(issue.reportedBy);
        if (user) {
          user.points += 20;
          await user.save();
          // Emit leaderboard updated
          const leaderboard = await User.find({}).sort({ points: -1 }).limit(10).select('name avatar points issuesReported');
          getIo().emit('leaderboardUpdated', leaderboard);
        }
      }

      // Populate for socket emit
      const populatedIssue = await Issue.findById(updatedIssue._id)
        .populate('category', 'name icon')
        .populate('reportedBy', 'name');

      // Emit issue updated
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
