const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Issue = require('../models/Issue');
const {
  computeBadges,
  getStartOfMonth,
  getStartOfWeek,
} = require('../utils/gamification');

const MONTH_WINDOW = 6;
const DEFAULT_PASSWORD = '123456';

const SEED_PROFILES = [
  { name: 'Digital Samvad Admin', email: 'admin@samvad.com', role: 'admin', city: 'Ahmedabad', activity: 'high' },
  { name: 'Mehul Patel', email: 'staff1@samvad.com', role: 'staff', city: 'Surat', activity: 'high' },
  { name: 'Nisha Desai', email: 'staff2@samvad.com', role: 'staff', city: 'Vadodara', activity: 'medium' },
  { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', role: 'user', city: 'Ahmedabad', activity: 'high' },
  { name: 'Priya Mehta', email: 'priya.mehta@gmail.com', role: 'user', city: 'Surat', activity: 'high' },
  { name: 'Amit Patel', email: 'amit.patel@gmail.com', role: 'user', city: 'Anand', activity: 'medium' },
  { name: 'Neha Joshi', email: 'neha.joshi@gmail.com', role: 'user', city: 'Vadodara', activity: 'medium' },
  { name: 'Vikram Shah', email: 'vikram.shah@gmail.com', role: 'user', city: 'Rajkot', activity: 'medium' },
  { name: 'Kavita Trivedi', email: 'kavita.trivedi@gmail.com', role: 'user', city: 'Ahmedabad', activity: 'high' },
  { name: 'Sanjay Parmar', email: 'sanjay.parmar@gmail.com', role: 'user', city: 'Surat', activity: 'low' },
  { name: 'Pooja Bhatt', email: 'pooja.bhatt@gmail.com', role: 'user', city: 'Vadodara', activity: 'medium' },
  { name: 'Jignesh Solanki', email: 'jignesh.solanki@gmail.com', role: 'user', city: 'Rajkot', activity: 'medium' },
  { name: 'Hetal Shah', email: 'hetal.shah@gmail.com', role: 'user', city: 'Anand', activity: 'low' },
  { name: 'Rakesh Chauhan', email: 'rakesh.chauhan@gmail.com', role: 'user', city: 'Surat', activity: 'medium' },
  { name: 'Divya Patel', email: 'divya.patel@gmail.com', role: 'user', city: 'Ahmedabad', activity: 'high' },
  { name: 'Tushar Rana', email: 'tushar.rana@gmail.com', role: 'user', city: 'Rajkot', activity: 'low' },
  { name: 'Bhavna Iyer', email: 'bhavna.iyer@gmail.com', role: 'user', city: 'Vadodara', activity: 'medium' },
  { name: 'Yash Gohil', email: 'yash.gohil@gmail.com', role: 'user', city: 'Anand', activity: 'high' },
  { name: 'Sneha Vyas', email: 'sneha.vyas@gmail.com', role: 'user', city: 'Ahmedabad', activity: 'medium' },
  { name: 'Harshad Thakkar', email: 'harshad.thakkar@gmail.com', role: 'user', city: 'Surat', activity: 'low' },
  { name: 'Mitali Deshmukh', email: 'mitali.deshmukh@gmail.com', role: 'user', city: 'Vadodara', activity: 'medium' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@gmail.com', role: 'user', city: 'Rajkot', activity: 'high' },
  { name: 'Nandini Rao', email: 'nandini.rao@gmail.com', role: 'user', city: 'Ahmedabad', activity: 'medium' },
  { name: 'Parth Barot', email: 'parth.barot@gmail.com', role: 'user', city: 'Anand', activity: 'low' },
  { name: 'Ritu Agarwal', email: 'ritu.agarwal@gmail.com', role: 'user', city: 'Surat', activity: 'medium' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedRandom(users) {
  const weighted = users.flatMap((user) => {
    const copies = user.seedMeta.activity === 'high' ? 5 : user.seedMeta.activity === 'medium' ? 3 : 1;
    return Array.from({ length: copies }, () => user);
  });
  return randomFrom(weighted);
}

function randomDateWithinMonths(monthsBack = MONTH_WINDOW) {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - monthsBack);
  const time = randomInt(start.getTime(), now.getTime());
  return new Date(time);
}

function makeAvatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f766e&color=ffffff`;
}

function makeMobile(index) {
  return `9${String(830000000 + index * 73191).slice(0, 9)}`;
}

function buildStatusHistory(status, reporterId, staffId, createdAt) {
  const offset = (hours) => new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
  const reviewerId = staffId || reporterId;

  if (status === 'pending') {
    return [{ status: 'pending', updatedBy: reporterId, updatedAt: createdAt }];
  }

  if (status === 'rejected') {
    return [
      { status: 'pending', updatedBy: reporterId, updatedAt: createdAt },
      { status: 'rejected', updatedBy: reviewerId, updatedAt: offset(6) },
    ];
  }

  const history = [
    { status: 'pending', updatedBy: reporterId, updatedAt: createdAt },
    { status: 'verified', updatedBy: reviewerId, updatedAt: offset(6) },
  ];

  if (['assigned', 'in-progress', 'resolved', 'closed'].includes(status)) {
    history.push({ status: 'assigned', updatedBy: reviewerId, updatedAt: offset(12) });
  }
  if (['in-progress', 'resolved', 'closed'].includes(status)) {
    history.push({ status: 'in-progress', updatedBy: reviewerId, updatedAt: offset(24) });
  }
  if (['resolved', 'closed'].includes(status)) {
    history.push({ status: 'resolved', updatedBy: reviewerId, updatedAt: offset(48) });
  }
  if (status === 'closed') {
    history.push({ status: 'closed', updatedBy: reviewerId, updatedAt: offset(72) });
  }

  return history;
}

function clipPoints(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeStatus(status) {
  const map = {
    Open: 'pending',
    open: 'pending',
    solved: 'resolved',
    complete: 'closed',
  };

  return map[status] || status || 'pending';
}

async function upsertUsers() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const existingUsers = await User.find({ email: { $in: SEED_PROFILES.map((profile) => profile.email) } });
  const existingByEmail = new Map(existingUsers.map((user) => [user.email, user]));

  const inserts = [];
  const updates = [];

  SEED_PROFILES.forEach((profile, index) => {
    const createdAt = randomDateWithinMonths();
    const doc = {
      name: profile.name,
      email: profile.email,
      password: hashedPassword,
      role: profile.role,
      mobileNumber: makeMobile(index + 1),
      avatar: makeAvatar(profile.name),
      points: randomInt(50, 180),
      weeklyPoints: randomInt(0, 70),
      monthlyPoints: randomInt(20, 180),
      issuesReported: 0,
      issuesResolved: 0,
      verifiedIssuesCount: 0,
      badges: [],
      weeklyWindowStart: getStartOfWeek(),
      monthlyWindowStart: getStartOfMonth(),
      createdAt,
      updatedAt: new Date(),
    };

    const existing = existingByEmail.get(profile.email);
    if (existing) {
      updates.push({
        updateOne: {
          filter: { _id: existing._id },
          update: { $set: doc },
        },
      });
    } else {
      inserts.push(doc);
    }
  });

  if (updates.length > 0) {
    await User.bulkWrite(updates);
  }

  if (inserts.length > 0) {
    await User.insertMany(inserts);
  }

  const seededUsers = await User.find({ email: { $in: SEED_PROFILES.map((profile) => profile.email) } }).sort({ createdAt: 1 });
  const profileByEmail = new Map(SEED_PROFILES.map((profile) => [profile.email, profile]));

  seededUsers.forEach((user) => {
    user.seedMeta = profileByEmail.get(user.email);
  });

  return {
    users: seededUsers,
    inserted: inserts.length,
    updated: updates.length,
  };
}

async function relinkIssues(citizens, staffUsers) {
  const issues = await Issue.find({}).sort({ createdAt: 1 });

  if (issues.length === 0) {
    return { relinked: 0, issues: [] };
  }

  const staffPool = staffUsers.length > 0 ? staffUsers : citizens.slice(0, 1);

  for (const issue of issues) {
    const reporter = weightedRandom(citizens);
    const staff = randomFrom(staffPool);
    const normalizedStatus = normalizeStatus(issue.status);
    const isAssignedStatus = ['assigned', 'in-progress', 'resolved', 'closed'].includes(normalizedStatus);
    const isVerifiedStatus = ['verified', 'assigned', 'in-progress', 'resolved', 'closed'].includes(normalizedStatus);
    const isResolvedStatus = ['resolved', 'closed'].includes(normalizedStatus);
    const normalizedLocation = typeof issue.location === 'string'
      ? issue.location
      : issue.location?.address || `${reporter.seedMeta.city}, Gujarat`;
    const upvoteCandidates = citizens.filter((user) => user._id.toString() !== reporter._id.toString());
    const upvoteCount = isVerifiedStatus ? Math.min(upvoteCandidates.length, randomInt(1, Math.min(12, upvoteCandidates.length || 1))) : randomInt(0, Math.min(3, upvoteCandidates.length));
    const shuffled = [...upvoteCandidates].sort(() => Math.random() - 0.5);

    issue.reportedBy = reporter._id;
    issue.status = normalizedStatus;
    issue.assignedTo = isAssignedStatus ? staff._id : null;
    issue.location = normalizedLocation;
    issue.rewardedForVerification = isVerifiedStatus;
    issue.rewardedForResolution = isResolvedStatus;
    issue.upvotedBy = shuffled.slice(0, upvoteCount).map((user) => user._id);
    issue.upvotes = issue.upvotedBy.length;
    issue.votes = issue.upvotes;
    issue.statusHistory = buildStatusHistory(normalizedStatus, reporter._id, staff?._id, issue.createdAt || randomDateWithinMonths());
    issue.updatedAt = new Date();

    await issue.save();
  }

  return { relinked: issues.length, issues };
}

async function refreshGamification(users) {
  const issueDocs = await Issue.find({}).select('reportedBy assignedTo status rewardedForVerification rewardedForResolution upvotes');
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  users.forEach((user) => {
    user.issuesReported = 0;
    user.verifiedIssuesCount = 0;
    user.issuesResolved = 0;
    user.points = 0;
    user.weeklyPoints = 0;
    user.monthlyPoints = 0;
    user.weeklyWindowStart = getStartOfWeek();
    user.monthlyWindowStart = getStartOfMonth();
  });

  issueDocs.forEach((issue) => {
    const reporter = usersById.get(issue.reportedBy?.toString());
    const assignee = usersById.get(issue.assignedTo?.toString());

    if (reporter) {
      reporter.issuesReported += 1;
      if (issue.rewardedForVerification) {
        reporter.verifiedIssuesCount += 1;
      }
      if (issue.rewardedForResolution) {
        reporter.issuesResolved += 1;
      }
    }

    if (assignee && ['resolved', 'closed'].includes(issue.status)) {
      assignee.issuesResolved += 1;
    }
  });

  users.forEach((user) => {
    const issueRewardPoints = user.verifiedIssuesCount * 50;
    const resolutionPoints = user.issuesResolved * 40;
    const activityBonus = user.seedMeta.role === 'user'
      ? user.seedMeta.activity === 'high'
        ? randomInt(25, 90)
        : user.seedMeta.activity === 'medium'
          ? randomInt(15, 55)
          : randomInt(5, 30)
      : user.seedMeta.role === 'staff'
        ? randomInt(35, 70)
        : randomInt(45, 90);
    const supportPoints = clipPoints(
      issueDocs
        .filter((issue) => issue.reportedBy?.toString() === user._id.toString() && issue.rewardedForVerification)
        .reduce((sum, issue) => sum + (issue.upvotes || 0), 0),
      0,
      120
    );

    user.points = clipPoints(issueRewardPoints + resolutionPoints + supportPoints + activityBonus, 50, 500);
    user.monthlyPoints = clipPoints(randomInt(Math.min(20, user.points), Math.min(300, user.points)), 0, 300);
    user.weeklyPoints = clipPoints(randomInt(0, Math.min(100, user.monthlyPoints)), 0, 100);
    user.badges = computeBadges(user);
  });

  await Promise.all(users.map((user) => user.save()));
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured in backend/.env');
  }

  await connectDB();

  try {
    const { users, inserted, updated } = await upsertUsers();
    const citizens = users.filter((user) => user.role === 'user');
    const staffUsers = users.filter((user) => user.role === 'staff' || user.role === 'admin');

    if (citizens.length === 0) {
      throw new Error('Citizen seed pool is empty. At least one user role entry is required.');
    }

    const { relinked } = await relinkIssues(citizens, staffUsers);
    await refreshGamification(users);

    const topUsers = [...users]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((user) => `${user.name} (${user.points})`);

    console.log(`Seeded users: inserted ${inserted}, updated ${updated}.`);
    console.log(`Total managed seed users: ${users.length}.`);
    console.log(`Issues relinked to seeded users: ${relinked}.`);
    console.log(`Admin account: admin@samvad.com / ${DEFAULT_PASSWORD}`);
    console.log(`Staff accounts: staff1@samvad.com, staff2@samvad.com / ${DEFAULT_PASSWORD}`);
    console.log(`Top leaderboard preview: ${topUsers.join(', ')}`);
  } finally {
    await mongoose.connection.close();
  }
}

main()
  .then(() => {
    console.log('User seed completed successfully.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('User seed failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  });
