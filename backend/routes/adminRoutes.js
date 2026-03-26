const express = require('express');
const { getDashboardStats, getUsers, getAdminIssues, updateIssueStatus, assignIssue, deleteIssue } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const router = express.Router();

router.route('/dashboard').get(protect, admin, getDashboardStats);
router.route('/users').get(protect, admin, getUsers);
router.route('/issues').get(protect, admin, getAdminIssues);
router.route('/issues/:id/status').patch(protect, admin, updateIssueStatus);
router.route('/issues/:id/assign').patch(protect, admin, assignIssue);
router.route('/issues/:id').delete(protect, admin, deleteIssue);

module.exports = router;
