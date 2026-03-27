const path = require('path');

// Reuse backend-local dependencies from the existing API runtime.
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({
  path: path.join(__dirname, '..', 'backend', '.env'),
});

const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));
const connectDB = require('../backend/config/db');
const User = require('../backend/models/User');
const Issue = require('../backend/models/Issue');
const Category = require('../backend/models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Roads & Infrastructure', icon: 'roads' },
  { name: 'Electricity', icon: 'electricity' },
  { name: 'Water Supply', icon: 'water' },
  { name: 'Sanitation & Waste', icon: 'waste' },
  { name: 'Public Safety', icon: 'safety' },
  { name: 'Parks & Gardens', icon: 'parks' },
  { name: 'Drainage & Sewage', icon: 'drainage' },
];

const LOCATIONS = [
  { city: 'Anand', lat: 22.5645, lng: 72.9289 },
  { city: 'Surat', lat: 21.1702, lng: 72.8311 },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { city: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { city: 'Rajkot', lat: 22.3039, lng: 70.8022 },
];

const STATUS_OPTIONS = ['pending', 'assigned', 'in-progress', 'resolved', 'closed', 'rejected'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const ISSUE_PATTERNS = [
  {
    title: 'Large pothole near market',
    description: 'Deep pothole causing accidents during traffic hours and damaging two-wheelers.',
    category: 'Roads & Infrastructure',
    address: 'Station Road',
  },
  {
    title: 'Streetlight outage in residential lane',
    description: 'Multiple streetlights have stopped working, making the lane unsafe after dark.',
    category: 'Electricity',
    address: 'Old Town Road',
  },
  {
    title: 'Irregular water supply in colony',
    description: 'Residents are receiving low-pressure water for less than an hour each morning.',
    category: 'Water Supply',
    address: 'Shanti Nagar',
  },
  {
    title: 'Garbage bins overflowing near bus stand',
    description: 'Uncollected waste is spilling onto the road and attracting stray animals.',
    category: 'Sanitation & Waste',
    address: 'Central Bus Stand',
  },
  {
    title: 'Broken divider causing traffic risk',
    description: 'A damaged road divider is forcing vehicles into the wrong lane during peak traffic.',
    category: 'Public Safety',
    address: 'Ring Road Junction',
  },
  {
    title: 'Damaged play equipment in park',
    description: 'Broken swings and rusted slides are creating safety concerns for children.',
    category: 'Parks & Gardens',
    address: 'Municipal Garden',
  },
  {
    title: 'Open drainage chamber on footpath',
    description: 'The uncovered chamber is hazardous for pedestrians, especially at night.',
    category: 'Drainage & Sewage',
    address: 'Hospital Road',
  },
  {
    title: 'Roadside waterlogging after rainfall',
    description: 'Rainwater is not draining properly and is blocking the service lane.',
    category: 'Drainage & Sewage',
    address: 'Lake View Road',
  },
  {
    title: 'Loose electric wiring near pole',
    description: 'Exposed wiring near a utility pole poses a shock risk to passersby.',
    category: 'Electricity',
    address: 'Temple Street',
  },
  {
    title: 'Cracked road surface near school',
    description: 'The damaged road surface is slowing traffic and creating dust for nearby classrooms.',
    category: 'Roads & Infrastructure',
    address: 'School Road',
  },
  {
    title: 'Public tap leaking continuously',
    description: 'A municipal water tap has been leaking for days and wasting clean water.',
    category: 'Water Supply',
    address: 'Ward Office Corner',
  },
  {
    title: 'Uncleared debris in community park',
    description: 'Tree branches and litter have been lying in the park for over a week.',
    category: 'Parks & Gardens',
    address: 'Riverfront Park',
  },
];

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOffset() {
  return (Math.random() - 0.5) * 0.08;
}

function randomCreatedAt() {
  const daysAgo = randomInt(0, 45);
  const hoursAgo = randomInt(0, 23);
  const minutesAgo = randomInt(0, 59);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date;
}

function buildStatusHistory(status, userId, createdAt) {
  const workflow = ['pending', 'assigned', 'in-progress', 'resolved', 'closed'];
  if (status === 'rejected') {
    return [
      {
        status: 'pending',
        updatedBy: userId,
        updatedAt: createdAt,
      },
      {
        status: 'rejected',
        updatedBy: userId,
        updatedAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
      },
    ];
  }

  const endIndex = workflow.indexOf(status);
  return workflow.slice(0, endIndex + 1).map((step, index) => ({
    status: step,
    updatedBy: userId,
    updatedAt: new Date(createdAt.getTime() + index * 2 * 60 * 60 * 1000),
  }));
}

async function getOrCreateUser() {
  let user = await User.findOne({ email: 'test@samvad.com' });

  if (!user) {
    user = await User.create({
      name: 'Test User',
      email: 'test@samvad.com',
      password: 'samvad123',
      mobileNumber: '9876543210',
      // Current schema allows user/admin/staff only. Use the compatible citizen equivalent.
      role: 'user',
    });
  }

  return user;
}

async function getOrCreateCategories() {
  let categories = await Category.find({});

  if (categories.length === 0) {
    categories = await Category.insertMany(DEFAULT_CATEGORIES);
  }

  return categories;
}

function buildIssues(count, user, categories) {
  const categoryMap = new Map(categories.map((category) => [category.name, category]));
  const issues = [];

  for (let index = 0; index < count; index += 1) {
    const location = pickRandom(LOCATIONS);
    const pattern = pickRandom(ISSUE_PATTERNS);
    const category = categoryMap.get(pattern.category) || categories[0];
    const status = pickRandom(STATUS_OPTIONS);
    const priority = pickRandom(PRIORITY_OPTIONS);
    const createdAt = randomCreatedAt();
    const latitude = Number((location.lat + randomOffset()).toFixed(6));
    const longitude = Number((location.lng + randomOffset()).toFixed(6));
    const votes = randomInt(0, 30);
    const commentsCount = randomInt(0, 10);

    const issue = {
      title: pattern.title,
      description: `${pattern.description} Report ${index + 1} filed from ${location.city} for dashboard and workflow testing.`,
      category: category._id,
      location: `${pattern.address}, ${location.city}, Gujarat`,
      latitude,
      longitude,
      status,
      priority,
      reportedBy: user._id,
      votes,
      // The current schema has no commentsCount field. Keep it in the seed payload
      // for logging/compat expectations, but Mongoose will ignore it during insert.
      commentsCount,
      statusHistory: buildStatusHistory(status, user._id, createdAt),
      createdAt,
      updatedAt: createdAt,
    };

    if (status === 'assigned' || status === 'in-progress' || status === 'resolved' || status === 'closed') {
      issue.assignedTo = user._id;
    }

    issues.push(issue);
  }

  return issues;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured. Expected backend/.env to define it.');
  }

  await connectDB();

  try {
    const user = await getOrCreateUser();
    const categories = await getOrCreateCategories();
    const issueCount = randomInt(20, 30);
    const issues = buildIssues(issueCount, user, categories);

    const inserted = await Issue.insertMany(issues);

    const totalReportedByUser = await Issue.countDocuments({ reportedBy: user._id });
    const resolvedCount = await Issue.countDocuments({ reportedBy: user._id, status: 'resolved' });

    user.issuesReported = totalReportedByUser;
    if (user.points < resolvedCount * 20) {
      user.points = resolvedCount * 20;
    }
    await user.save();

    console.log(`Inserted ${inserted.length} civic issues.`);
    console.log(`User used: ${user.name} <${user.email}> (${user.role})`);
    console.log(`Categories used: ${categories.map((category) => category.name).join(', ')}`);
  } finally {
    await mongoose.connection.close();
  }
}

main()
  .then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  });
