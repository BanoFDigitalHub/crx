const express = require('express');
const router = express.Router();
const User = require('../models/User'); // assume User model hai

// Update wallet based on referral count
router.post('/update-wallet', async (req, res) => {
  try {
    const userId = req.user.id; // middleware se user set hoga
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // calculate total batches of 5 referrals
    const referralBatches = Math.floor(user.referralCount / 5);

    // wallet update only if new batch completed
    if (user.wallet < referralBatches) {
      const addedAmount = referralBatches - user.wallet;
      user.wallet += addedAmount; // add only new batch reward
      await user.save();
      return res.json({
        message: `$${addedAmount} deposited to wallet`,
        wallet: user.wallet,
      });
    }

    res.json({
      message: 'No new rewards yet',
      wallet: user.wallet,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
