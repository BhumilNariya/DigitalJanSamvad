const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({});
    
    // Auto-seed Categories if database is empty to prevent Dropdown crash
    if (categories.length === 0) {
      const defaultCategories = [
        "Roads & Infrastructure",
        "Water Supply",
        "Garbage Management",
        "Electricity",
        "Public Safety",
        "Other"
      ];
      
      const categoryDocs = defaultCategories.map(name => ({
        name,
        icon: 'alert-circle', 
        description: `Issues related to ${name.toLowerCase()}`
      }));
      
      await Category.insertMany(categoryDocs);
      categories = await Category.find({});
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories };
