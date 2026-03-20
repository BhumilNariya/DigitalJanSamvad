const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .sort({ points: -1 }) // Sort by points descending
      .limit(10) // Top 10 users
      .select('name avatar points issuesReported');

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
