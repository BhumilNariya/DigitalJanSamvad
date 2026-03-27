const User = require('../models/User');
const {
  getStartOfWeek,
  getStartOfMonth,
  syncPointWindows,
  formatLeaderboardEntry,
} = require('../utils/gamification');

const buildLeaderboard = async (sortField, res) => {
  try {
    const weekStart = getStartOfWeek();
    const monthStart = getStartOfMonth();

    if (sortField === 'weeklyPoints') {
      await User.updateMany(
        {
          $or: [
            { weeklyWindowStart: { $exists: false } },
            { weeklyWindowStart: null },
            { weeklyWindowStart: { $lt: weekStart } },
          ],
        },
        { $set: { weeklyPoints: 0, weeklyWindowStart: weekStart } }
      );
    }

    if (sortField === 'monthlyPoints') {
      await User.updateMany(
        {
          $or: [
            { monthlyWindowStart: { $exists: false } },
            { monthlyWindowStart: null },
            { monthlyWindowStart: { $lt: monthStart } },
          ],
        },
        { $set: { monthlyPoints: 0, monthlyWindowStart: monthStart } }
      );
    }

    const users = await User.find({})
      .sort({ [sortField]: -1, points: -1, issuesReported: -1, createdAt: 1 })
      .limit(20);

    let changed = false;
    users.forEach((user) => {
      const beforeWeekly = user.weeklyPoints;
      const beforeMonthly = user.monthlyPoints;
      syncPointWindows(user);
      if (beforeWeekly !== user.weeklyPoints || beforeMonthly !== user.monthlyPoints) {
        changed = true;
      }
    });

    if (changed) {
      await Promise.all(users.map((user) => user.save()));
    }

    const leaderboard = users.map((user, index) => formatLeaderboardEntry(user, index + 1, sortField));
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => buildLeaderboard('points', res);
const getWeeklyLeaderboard = async (req, res) => buildLeaderboard('weeklyPoints', res);
const getMonthlyLeaderboard = async (req, res) => buildLeaderboard('monthlyPoints', res);
const getMostReportedLeaderboard = async (req, res) => buildLeaderboard('issuesReported', res);

module.exports = {
  getLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getMostReportedLeaderboard,
};
