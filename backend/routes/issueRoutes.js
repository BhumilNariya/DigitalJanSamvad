const express = require('express');
const { createIssue, getIssues, getIssueById } = require('../controllers/issueController');
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/', protect, upload.single('image'), createIssue);
router.route('/').get(getIssues);

router.route('/:id').get(getIssueById);
router.route('/:id/comments').get(getComments).post(protect, addComment);

module.exports = router;

