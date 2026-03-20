const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const router = express.Router();

router.route('/').get(getLeaderboard);

module.exports = router;
