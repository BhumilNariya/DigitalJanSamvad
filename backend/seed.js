const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const categories = [
  { name: 'Roads & Infrastructure', icon: '🛣️' },
  { name: 'Electricity', icon: '💡' },
  { name: 'Water Supply', icon: '💧' },
  { name: 'Sanitation & Waste', icon: '🗑️' },
  { name: 'Public Safety', icon: '🚨' },
  { name: 'Parks & Gardens', icon: '🌳' },
  { name: 'Drainage & Sewage', icon: '🚰' },
  { name: 'Other', icon: '📋' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing categories to avoid duplicates
    await Category.deleteMany();
    console.log('Cleared existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('Successfully added Categories!');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
