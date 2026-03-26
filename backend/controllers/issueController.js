const Issue = require('../models/Issue');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { getIo } = require('../socket/socketServer');
const axios = require('axios');

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
    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category,
      location: newLocation,
      imageUrl,
      reportedBy: req.user._id,
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

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const { category, status, sortByDesc } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    const sortOption = sortByDesc === 'false' ? { createdAt: 1 } : { createdAt: -1 };

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
