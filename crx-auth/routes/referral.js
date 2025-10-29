// routes/referralRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');


// Get referral data for logged-in user
router.get('/data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('referrals', 'name email createdAt')
      .select('name referralCode referralCount lastProcessedBatch wallet referrals');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      lastProcessedBatch: user.lastProcessedBatch || 0,
      wallet: user.wallet || 0,
      referrals: user.referrals || []
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim referral reward ($1 for every 5 referrals)
router.post('/claim', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const lastBatch = user.lastProcessedBatch || 0;
    const totalReferrals = user.referralCount || 0;
    const currentBatchCount = totalReferrals - (lastBatch * 5);

    // Check if user has at least 5 new referrals
    if (currentBatchCount < 5) {
      return res.status(400).json({ 
        success: false,
        message: `You need ${5 - currentBatchCount} more referrals to claim reward` 
      });
    }

    // Calculate reward amount ($1 per 5 referrals)
    const completedBatches = Math.floor(currentBatchCount / 5);
    const rewardAmount = completedBatches * 1; // $1 per batch

    // Update user wallet and processed batch count
    user.wallet = (user.wallet || 0) + rewardAmount;
    user.lastProcessedBatch = lastBatch + completedBatches;
    
    await user.save();

    res.json({
      success: true,
      message: 'Reward claimed successfully!',
      rewardAmount: rewardAmount,
      newWallet: user.wallet,
      newLastProcessedBatch: user.lastProcessedBatch,
      remainingReferrals: totalReferrals - (user.lastProcessedBatch * 5)
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while claiming reward' 
    });
  }
});

// Get referral statistics (optional - for dashboard)
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('referrals', 'createdAt activePlan');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalReferrals = user.referralCount || 0;
    const lastBatch = user.lastProcessedBatch || 0;
    const currentBatchCount = totalReferrals - (lastBatch * 5);
    const activeReferrals = user.referrals.filter(ref => ref.activePlan).length;

    res.json({
      totalReferrals,
      currentBatchCount,
      remainingForReward: Math.max(0, 5 - currentBatchCount),
      totalBatchesClaimed: lastBatch,
      totalEarned: lastBatch * 1, // $1 per batch
      activeReferrals
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;