const Issue = require('../models/Issue');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { getIo } = require('../socket/socketServer');
const axios = require('axios');
const { awardUpvotePoints } = require('../utils/gamification');

// ─── Helper: upload a Buffer to Cloudinary using a data URI ────────────────
// Avoids all stream/pipe complexity — works reliably with Cloudinary SDK v2
// and multer v2 memory storage.
const uploadBufferToCloudinary = async (buffer, mimetype) => {
  const b64 = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'samvad-issues',
  });
  return result.secure_url;
};

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    // ── Debug: log exactly what multer gave us ────────────────────────────
    console.log('[createIssue] req.body:', req.body);
    console.log('[createIssue] req.file:', req.file
      ? {
          fieldname: req.file.fieldname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          hasBuffer: !!req.file.buffer,
          hasDiskPath: !!req.file.path,
        }
      : '(no file)');

    // Guard: authenticated user must exist
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authorized — user not found' });
    }

    const { title, description, category, location } = req.body;

    // Validate required text fields
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    // ── Upload image (if provided) ────────────────────────────────────────
    let imageUrl = '';
    if (req.file) {
      const hasCloudinaryCreds =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME.trim().length > 0 &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;

      if (hasCloudinaryCreds && req.file.buffer) {
        // Memory storage + valid Cloudinary creds → upload via data URI
        console.log('[createIssue] Uploading to Cloudinary via data URI...');
        imageUrl = await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype);
        console.log('[createIssue] ✅ Cloudinary URL:', imageUrl);
      } else if (req.file.path) {
        // Disk storage fallback (dev without Cloudinary)
        if (req.file.path.startsWith('http')) {
          imageUrl = req.file.path;
        } else {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }
        console.log('[createIssue] Local disk URL:', imageUrl);
      }
    }

    // ── Geocode location if missing coordinates ───────────────────────
    let newLocation = { latitude: null, longitude: null, address: '' };

    if (typeof location === 'object' && location !== null) {
      newLocation = location;
    } else if (typeof location === 'string') {
      newLocation.address = location.trim();
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: newLocation.address, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'SamvadApp/1.0' }
        });
        if (response.data && response.data.length > 0) {
          newLocation.latitude = parseFloat(response.data[0].lat);
          newLocation.longitude = parseFloat(response.data[0].lon);
        }
      } catch (err) {
        console.error('[createIssue] Geocoding failed:', err.message);
      }
    }

    // ── Save issue to MongoDB ──────────────────────────────────────────────
    // Parse location: frontend sends separate latitude/longitude fields OR a location object
    let locationStr = '';
    let lat = null;
    let lng = null;

    if (req.body.latitude) lat = parseFloat(req.body.latitude);
    if (req.body.longitude) lng = parseFloat(req.body.longitude);
    if (req.body.address) locationStr = req.body.address.trim();

    // If location sent as object (e.g. from older clients)
    if (!locationStr && typeof location === 'object' && location !== null) {
      locationStr = location.address || '';
      lat = (lat ?? parseFloat(location.lat || location.latitude)) || null;
      lng = (lng ?? parseFloat(location.lng || location.longitude)) || null;
    } else if (!locationStr && typeof location === 'string') {
      locationStr = location.trim();
    }

    // Geocode if address known but coords missing
    if (locationStr && (!lat || !lng)) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: locationStr, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'SamvadApp/1.0' }
        });
        if (response.data && response.data.length > 0) {
          lat = parseFloat(response.data[0].lat);
          lng = parseFloat(response.data[0].lon);
        }
      } catch (err) {
        console.error('[createIssue] Geocoding failed:', err.message);
      }
    }

    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category,
      location: locationStr || undefined,
      latitude: lat || undefined,
      longitude: lng || undefined,
      imageUrl,
      reportedBy: req.user._id,
      statusHistory: [{
        status: 'pending',
        updatedBy: req.user._id,
        updatedAt: new Date()
      }]
    });

    console.log('[createIssue] Saving to MongoDB:', {
      title: issue.title,
      category: issue.category,
      imageUrl: issue.imageUrl || '(none)',
    });

    await issue.save();

    // Increment the reporter's issue count
    await User.findByIdAndUpdate(req.user._id, { $inc: { issuesReported: 1 } });

    const savedIssue = await Issue.findById(issue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name avatar');

    console.log('[createIssue] ✅ Saved. MongoDB _id:', savedIssue._id.toString());

    // Real-time broadcast (non-critical — don't fail request if socket not ready)
    try { getIo().emit('newIssue', savedIssue); } catch (_) {}

    res.status(201).json({ success: true, issue: savedIssue });
  } catch (error) {
    console.error('[createIssue] ❌ Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all issues with pagination and search
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const { category, status, sortByDesc, search } = req.query;
    const query = {};

    if (category && category !== 'All' && category !== 'all') {
      // Find category by name if it's a string, or support ID matching
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const Category = require('../models/Category');
        const catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (catDoc) query.category = catDoc._id;
      }
    }

    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location': searchRegex },
      ];
    }

    // Default sort by trending (upvotes), then by newest/oldest 
    let sortOption = {};
    if (sortByDesc === 'trending') {
      sortOption = { upvotes: -1, votes: -1, createdAt: -1 };
    } else if (sortByDesc === 'oldest' || sortByDesc === 'false') {
      sortOption = { createdAt: 1 };
    } else {
      // 'newest' or default
      sortOption = { createdAt: -1 };
    }

    const totalIssues = await Issue.countDocuments(query);

    const issues = await Issue.find(query)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name avatar')
      .populate('statusHistory.updatedBy', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    console.log('[getIssues] Returning issues:', issues.length);

    res.json({
      success: true,
      data: issues,
      issues,
      totalIssues,
      totalPages: Math.ceil(totalIssues / limit),
      currentPage: page,
    });
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
      .populate('reportedBy', 'name avatar email mobileNumber')
      .populate('assignedTo', 'name')
      .populate('statusHistory.updatedBy', 'name');

    if (issue) {
      res.json(issue);
    } else {
      res.status(404).json({ message: 'Issue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = (issue.upvotedBy || []).some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
      return res.status(400).json({ success: false, message: 'You have already upvoted this issue' });
    }

    issue.upvotedBy.push(req.user._id);
    issue.votes += 1;
    issue.upvotes += 1;

    const reporter = await User.findById(issue.reportedBy);
    const reporterRewarded = await awardUpvotePoints(reporter, issue);

    await issue.save();
    if (reporterRewarded) {
      await reporter.save();
    }

    const populatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name avatar email mobileNumber')
      .populate('assignedTo', 'name')
      .populate('statusHistory.updatedBy', 'name');

    try {
      getIo().emit('issueUpdated', populatedIssue);
      if (reporterRewarded) {
        const topUsers = await User.find({})
          .sort({ points: -1, issuesReported: -1, createdAt: 1 })
          .limit(10)
          .select('name avatar points weeklyPoints monthlyPoints issuesReported issuesResolved verifiedIssuesCount badges');
        getIo().emit('leaderboardUpdated', topUsers);
      }
    } catch (_) {}

    res.json({ success: true, data: populatedIssue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createIssue, getIssues, getIssueById, upvoteIssue };
