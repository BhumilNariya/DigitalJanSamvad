const Issue = require('../models/Issue');
const User = require('../models/User');
const { getIo } = require('../socket/socketServer');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, category, email, mobileNumber, latitude, longitude, address } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      imageUrl,
      email,
      mobileNumber,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address
      },
      reportedBy: req.user._id
    });

    // Update user points and issues reported
    const user = await User.findById(req.user._id);
    user.points += 10;
    user.issuesReported += 1;
    await user.save();

    // Populate category and user for socket emit
    const populatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name');

    // Emit socket event
    getIo().emit('newIssue', populatedIssue);

    // Also emit leaderboard update as points changed
    const leaderboard = await User.find({}).sort({ points: -1 }).limit(10).select('name avatar points issuesReported');
    getIo().emit('leaderboardUpdated', leaderboard);

    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const { category, status, sortByDesc } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    let sortOption = { createdAt: -1 };
    if (sortByDesc === 'false') sortOption = { createdAt: 1 };

    const issues = await Issue.find(query)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name avatar')
      .sort(sortOption);

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name avatar');

    if (issue) {
      res.json(issue);
    } else {
      res.status(404).json({ message: 'Issue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createIssue, getIssues, getIssueById };
