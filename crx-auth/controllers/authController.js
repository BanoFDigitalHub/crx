const User = require('../models/User');
const Plan = require('../models/Plan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const generateUniqueReferral = require('../utils/generateReferral');

// ---------------- REGISTER ----------------
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      name,
      username,
      email,
      phone,
      password,
      confirmPassword,
      securityQuestion,
      securityAnswer,
      referralCode
    } = req.body;

    // Check existing user
    const existing = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });
    if (existing)
      return res
        .status(400)
        .json({ message: 'Email/Username/Phone already used' });

    // Hash password + security answer
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const securityAnswerHash = await bcrypt.hash(securityAnswer, salt);

    // Generate unique referral code
    const code = await generateUniqueReferral();

    // Create user instance
    const newUser = new User({
      name,
      username: username || null,
      email,
      phone: phone || null,
      password: passwordHash,
      securityQuestion,
      securityAnswerHash,
      referralCode: code
    });

    // ✅ If referred by someone → only save reference (no count yet)
    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: referralCode.trim()
      });
      if (referrer) {
        newUser.referredBy = referrer._id;
        // ⚠️ NO referralCount increase yet
        // We will increment it when the referred user’s plan is approved
      }
    }

    await newUser.save();

    // JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        referralCount: newUser.referralCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- LOGIN ----------------
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: 'Provide identifier and password' });

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
        { phone: identifier }
      ]
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralCount: user.referralCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- DASHBOARD ----------------
const dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('activePlan')
      .select('-password -securityAnswerHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activePlan = user.activePlan
      ? {
          id: user.activePlan._id,
          name: user.activePlan.name,
          totalInvestment: user.activePlan.totalInvestment,
          dailyAds: user.activePlan.dailyAds,
          dailyProfit: user.activePlan.dailyProfit,
          totalProfit: user.activePlan.totalProfit,
          durationDays: user.activePlan.durationDays
        }
      : null;

    res.json({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      wallet: user.wallet || 0,
      activePlan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, dashboard };
