const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  points: { type: Number, default: 0 },
  weeklyPoints: { type: Number, default: 0 },
  monthlyPoints: { type: Number, default: 0 },
  weeklyWindowStart: { type: Date, default: null },
  monthlyWindowStart: { type: Date, default: null },
  issuesReported: { type: Number, default: 0 },
  issuesResolved: { type: Number, default: 0 },
  verifiedIssuesCount: { type: Number, default: 0 },
  badges: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
