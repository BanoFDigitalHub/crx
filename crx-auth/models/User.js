// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, trim: true, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, trim: true, unique: true, sparse: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswerHash: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralCount: { type: Number, default: 0 },
  lastProcessedBatch: { type: Number, default: 0 },
  activePlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },

  wallet: { type: Number, default: 0 },

  // referrals etc.
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps:true });

module.exports = mongoose.model('User', userSchema);
