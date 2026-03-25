const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Issue = require('./models/Issue');
const User = require('./models/User');
const Category = require('./models/Category');

dotenv.config();

const gujaratLocations = [
  { address: 'SG Highway, Ahmedabad, Gujarat', lat: 23.0384, lng: 72.5119 },
  { address: 'Manek Chowk, Ahmedabad, Gujarat', lat: 23.0233, lng: 72.5855 },
  { address: 'Ring Road, Surat, Gujarat', lat: 21.1960, lng: 72.8277 },
  { address: 'Adajan, Surat, Gujarat', lat: 21.1950, lng: 72.7933 },
  { address: 'Alkapuri, Vadodara, Gujarat', lat: 22.3131, lng: 73.1656 },
  { address: 'Sardar Patel Ring Road, Rajkot, Gujarat', lat: 22.2887, lng: 70.8047 },
  { address: 'Waghawadi Road, Bhavnagar, Gujarat', lat: 21.7584, lng: 72.1384 },
  { address: 'Sector 11, Gandhinagar, Gujarat', lat: 23.2156, lng: 72.6369 }
];

const issueTemplates = [
  { title: 'Severe Potholes on Main Road', desc: 'Deep potholes causing traffic jams and vehicle damage.', categoryName: 'Roads & Infrastructure' },
  { title: 'Streetlights Not Working', desc: 'Entire street is dark at night, causing safety concerns.', categoryName: 'Electricity' },
  { title: 'Irregular Water Supply', desc: 'Water has not been supplied for the last 3 days in our society.', categoryName: 'Water Supply' },
  { title: 'Garbage Dumped on Corner', desc: 'Trash overflowing onto the street creating severe health hazards.', categoryName: 'Sanitation & Waste' },
  { title: 'Stray Cattle Menace', desc: 'Cows blocking the main intersection during rush hour.', categoryName: 'Public Safety' },
  { title: 'Broken Park Benches', desc: 'Most benches in the community park are broken and unusable.', categoryName: 'Parks & Gardens' },
  { title: 'Open Drainage Manhole', desc: 'Dangerous open manhole in the middle of the walking path.', categoryName: 'Drainage & Sewage' },
  { title: 'Illegal Encroachment on Footpath', desc: 'Shop vendors have completely blocked the pedestrian path.', categoryName: 'Other' },
  { title: 'Waterlogging After Rain', desc: 'Road is completely flooded after a short rain, bad drainage.', categoryName: 'Drainage & Sewage' },
  { title: 'Frequent Power Cuts', desc: 'Experiencing 4-5 hour power cuts daily without prior notice.', categoryName: 'Electricity' }
];

const seedIssues = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Make sure we have at least one user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Test Citizen',
        email: 'test@example.com',
        password: 'Password123!', 
        role: 'user'
      });
      console.log('Created test user');
    }

    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('Please run seed.js first to populate categories.');
      process.exit(1);
    }

    console.log('Clearing old issues...');
    await Issue.deleteMany({});
    
    await User.updateMany({}, { points: 0, issuesReported: 0 });

    const newIssues = [];
    let pointsEarned = 0;

    // Seed 15 random issues
    for (let i = 0; i < 15; i++) {
        const template = issueTemplates[Math.floor(Math.random() * issueTemplates.length)];
        const location = gujaratLocations[Math.floor(Math.random() * gujaratLocations.length)];
        const categoryDoc = categories.find(c => c.name === template.categoryName) || categories[0];
        
        // Ensure mixture of pending, in-progress, resolved
        const statusTypes = ['pending', 'in-progress', 'resolved'];
        const status = statusTypes[i % 3]; // Rotating status for variety

        newIssues.push({
            title: template.title,
            description: template.desc,
            category: categoryDoc._id,
            location: {
                latitude: location.lat + (Math.random() * 0.01 - 0.005),
                longitude: location.lng + (Math.random() * 0.01 - 0.005),
                address: location.address
            },
            status: status,
            reportedBy: user._id,
            image: ''
        });

        pointsEarned += 10;
        if (status === 'resolved') {
           pointsEarned += 20;
        }
    }

    await Issue.insertMany(newIssues);
    
    // Update user stats
    user.points = pointsEarned;
    user.issuesReported = newIssues.length;
    await user.save();

    console.log(`Successfully seeded ${newIssues.length} realistic Gujarat issues!`);
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedIssues();
