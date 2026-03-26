const fs = require('fs');

try {
  // Issue Controller update
  let ic = fs.readFileSync('backend/controllers/issueController.js', 'utf8');
  ic = ic.replace(/changedBy/g, 'updatedBy');
  ic = ic.replace(/changedAt/g, 'updatedAt');
  fs.writeFileSync('backend/controllers/issueController.js', ic);

  // Admin Controller update
  let ac = fs.readFileSync('backend/controllers/adminController.js', 'utf8');
  ac = ac.replace(/changedBy/g, 'updatedBy');
  ac = ac.replace(/changedAt/g, 'updatedAt');
  ac = ac.replace(/adminNotes/g, 'internalNotes');
  ac = ac.replace(/adminNoteSchema/g, 'internalNoteSchema');

  const updateIndex = ac.indexOf('// @desc    Update issue status');
  const assignIndex = ac.indexOf('// @desc    Assign staff');

  if (updateIndex === -1 || assignIndex === -1) {
    console.error("Could not find indices for splicing");
    process.exit(1);
  }

  const specificMethods = `
// @desc    Update an issue's general details (category, priority, etc)
// @route   PATCH /api/admin/issues/:id
// @access  Private/Admin
const updateIssueDetails = async (req, res) => {
  try {
    const { category, priority } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    if (category) issue.category = category;
    if (priority) issue.priority = priority;

    const updatedIssue = await issue.save();
    
    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

    getIo().emit('issueUpdated', populatedIssue);
    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const _updateStatus = async (req, res, newStatus) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const oldStatus = issue.status;
    if (oldStatus !== newStatus) {
      issue.status = newStatus;
      issue.statusHistory.push({
        status: newStatus,
        updatedBy: req.user._id,
        updatedAt: new Date()
      });
    }

    const updatedIssue = await issue.save();

    // Award +20 points to reporter when resolved
    if (oldStatus !== 'resolved' && updatedIssue.status === 'resolved') {
      const user = await User.findById(issue.reportedBy);
      if (user) {
        user.points += 20;
        await user.save();
        const leaderboard = await User.find({}).sort({ points: -1 }).limit(10).select('name avatar points issuesReported');
        getIo().emit('leaderboardUpdated', leaderboard);
      }
    }

    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email mobileNumber')
      .populate('assignedTo', 'name email')
      .populate('internalNotes.createdBy', 'name')
      .populate('statusHistory.updatedBy', 'name');

    const statusLabels = {
      pending: 'Pending Review', verified: 'Verified', assigned: 'Assigned to Staff',
      'in-progress': 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected',
    };

    const notification = await Notification.create({
      recipient: issue.reportedBy,
      type: 'status_change',
      message: \`Your issue "\${issue.title}" status changed to \${statusLabels[updatedIssue.status]}\`,
      issueId: issue._id,
    });

    getIo().to(issue.reportedBy.toString()).emit('newNotification', notification);
    getIo().emit('issueUpdated', populatedIssue);
    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyIssue = (req, res) => _updateStatus(req, res, 'verified');
const startIssue = (req, res) => _updateStatus(req, res, 'in-progress');
const resolveIssue = (req, res) => _updateStatus(req, res, 'resolved');
const closeIssue = (req, res) => _updateStatus(req, res, 'closed');
const rejectIssue = (req, res) => _updateStatus(req, res, 'rejected');
`;

  let newAc = ac.slice(0, updateIndex) + specificMethods + '\n' + ac.slice(assignIndex);

  newAc = newAc.replace('updateIssueStatus,', "updateIssueDetails, verifyIssue, startIssue, resolveIssue, closeIssue, rejectIssue,");

  fs.writeFileSync('backend/controllers/adminController.js', newAc);

  // Update routes
  let ar = fs.readFileSync('backend/routes/adminRoutes.js', 'utf8');
  ar = ar.replace('updateIssueStatus', 'updateIssueDetails, verifyIssue, startIssue, resolveIssue, closeIssue, rejectIssue');
  ar = ar.replace("router.route('/issues/:id/status').patch(protect, admin, updateIssueStatus);", 
\`router.route('/issues/:id').patch(protect, admin, updateIssueDetails);
router.route('/issues/:id/verify').patch(protect, admin, verifyIssue);
router.route('/issues/:id/start').patch(protect, admin, startIssue);
router.route('/issues/:id/resolve').patch(protect, admin, resolveIssue);
router.route('/issues/:id/close').patch(protect, admin, closeIssue);
router.route('/issues/:id/reject').patch(protect, admin, rejectIssue);\`);
  ar = ar.replace("router.route('/issues/:id/note').patch(protect, admin, addAdminNote);", "router.route('/issues/:id/note').post(protect, admin, addAdminNote);");
  fs.writeFileSync('backend/routes/adminRoutes.js', ar);

  console.log('Update script completed successfully!');
} catch(err) {
  console.error(err);
}
