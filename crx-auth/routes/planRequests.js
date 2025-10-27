const express = require('express');
const router = express.Router();
const multer = require('multer');
const PlanRequest = require('../models/planRequest');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const fs = require('fs');
const path = require('path');

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/proofs');
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload plan proof
router.post('/upload', auth, upload.single('proof'), async (req, res) => {
  try {
    const { planId, accountNumber } = req.body;
    if(!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const newRequest = new PlanRequest({
      user: req.userId,
      plan: planId,
      accountNumber,
      proof: req.file.filename // <-- field name must match model
    });

    await newRequest.save();
    res.json({ message: 'Request submitted successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all pending plan requests for admin
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const requests = await PlanRequest.find({ status: 'pending' }).populate('user');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve plan request
router.post('/admin/:id/approve', adminAuth, async (req, res) => {
  try {
    const request = await PlanRequest.findById(req.params.id).populate('user');
    if(!request) return res.status(404).json({ message: 'Request not found' });

    request.user.activePlan = request.plan;
    await request.user.save();

    request.status = 'approved';
    await request.save();

    res.json({ message: 'Plan request approved' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject plan request
router.post('/admin/:id/reject', adminAuth, async (req, res) => {
  try {
    const request = await PlanRequest.findById(req.params.id);
    if(!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Plan request rejected' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
