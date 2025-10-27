  const express = require('express');
  const router = express.Router();
  const { body } = require('express-validator');
  const authCtrl = require('../controllers/authController');
  const auth = require('../middleware/authMiddleware');
  const rateLimit = require('express-rate-limit');

  const loginLimiter = rateLimit({
    windowMs: 5*60*1000,
    max:5,
    message: 'Too many login attempts. Try again after 5 minutes.'
  });

  router.post('/register', [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min:6 }),
    body('confirmPassword').custom((v,{req}) => v === req.body.password),
    body('securityQuestion').notEmpty(),
    body('securityAnswer').notEmpty()
  ], authCtrl.register);

  router.post('/login', loginLimiter, [
    body('identifier').notEmpty(),
    body('password').notEmpty()
  ], authCtrl.login);

  router.get('/dashboard', auth, authCtrl.dashboard);

  module.exports = router;
