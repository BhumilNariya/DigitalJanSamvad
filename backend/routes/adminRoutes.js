const express = require('express');
const { getDashboardStats, getUsers, getAdminIssues, updateIssueDetails, verifyIssue, assignIssue, startIssue, resolveIssue, closeIssue, rejectIssue, deleteIssue, addInternalNote, getAdminIssueById } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const router = express.Router();

router.route('/dashboard').get(protect, admin, getDashboardStats);
router.route('/users').get(protect, admin, getUsers);
router.route('/issues').get(protect, admin, getAdminIssues);
router.route('/issues/:id').delete(protect, admin, deleteIssue).get(protect, admin, getAdminIssueById).patch(protect, admin, updateIssueDetails);
router.route('/issues/:id/verify').patch(protect, admin, verifyIssue);
router.route('/issues/:id/assign').patch(protect, admin, assignIssue);
router.route('/issues/:id/start').patch(protect, admin, startIssue);
router.route('/issues/:id/resolve').patch(protect, admin, resolveIssue);
router.route('/issues/:id/close').patch(protect, admin, closeIssue);
router.route('/issues/:id/reject').patch(protect, admin, rejectIssue);
router.route('/issues/:id/note').post(protect, admin, addInternalNote);

module.exports = router;
