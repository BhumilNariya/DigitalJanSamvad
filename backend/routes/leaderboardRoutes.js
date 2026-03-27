const express = require('express');
const {
  getLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getMostReportedLeaderboard,
} = require('../controllers/leaderboardController');
const router = express.Router();

router.route('/').get(getLeaderboard);
router.route('/weekly').get(getWeeklyLeaderboard);
router.route('/monthly').get(getMonthlyLeaderboard);
router.route('/reported').get(getMostReportedLeaderboard);

module.exports = router;
