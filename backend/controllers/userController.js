const User = require('../models/User');
const { syncPointWindows, computeBadges } = require('../utils/gamification');

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      syncPointWindows(user);
      user.badges = computeBadges(user);
      await user.save();

      const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        weeklyPoints: user.weeklyPoints,
        monthlyPoints: user.monthlyPoints,
        issuesReported: user.issuesReported,
        issuesResolved: user.issuesResolved,
        verifiedIssuesCount: user.verifiedIssuesCount,
        badges: user.badges,
        rank,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile };
