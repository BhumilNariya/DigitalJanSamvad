const express = require('express');
const { createIssue, getIssues, getIssueById } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, upload.single('image'), createIssue)
  .get(getIssues);

router.route('/:id').get(getIssueById);

module.exports = router;
