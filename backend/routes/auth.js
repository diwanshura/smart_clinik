const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendLoginNotification, sendWelcomeNotification } = require('../utils/notifications');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route  POST /api/auth/register
// @desc   Register a new patient
// @access Public
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^\+?[\d\s-]{10,15}$/).withMessage('Valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('⚠️ Registration Validation Errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, dateOfBirth, gender, bloodGroup, role } = req.body;

    try {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log(`❌ Registration failed: User already exists (${email})`);
        return res.status(400).json({ error: 'User already exists.' });
      }

      // SECURITY: public registration may only create patients or doctors.
      // Admin accounts are created with the seed script / directly in the database.
      const safeRole = ['patient', 'doctor'].includes(role) ? role : 'patient';

      const user = new User({
        name,
        email,
        phone,
        password,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        role: safeRole,
      });
      await user.save();
      console.log(`✅ User registered: ${email}`);

      // AUTO-CREATE DOCTOR PROFILE if role is doctor
      if (user.role === 'doctor') {
        const Doctor = require('../models/Doctor');
        const newDoctor = new Doctor({
          userId: user._id,
          specialization: 'General Physician',
          consultationFee: 500,
          isAvailable: true,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: { start: '09:00', end: '17:00' }
        });
        await newDoctor.save();
      }

      if (!process.env.JWT_SECRET) {
        console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in environment variables!');
        return res.status(500).json({ error: 'Server configuration error (JWT).' });
      }

      const token = generateToken(user._id);

      // Send welcome push notification
      sendWelcomeNotification(user).catch(err => console.error('Welcome notification error:', err.message));

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      console.error('❌ Registration Error:', err);
      res.status(500).json({ error: 'Server error during registration.', detail: err.message });
    }
  }
);

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      console.log(`🔑 Login attempt for: ${email}`);
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        console.log(`❌ Login failed: User not found (${email})`);
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log(`❌ Login failed: Incorrect password for (${email})`);
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated.' });
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id);

      // Send login push notification
      sendLoginNotification(user).catch(err => console.error('Login notification error:', err.message));

      res.json({
        message: 'Login successful',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  }
);

// @route  POST /api/auth/google
// @desc   Sign in or sign up with Google OAuth
// @access Public
router.post('/google', async (req, res) => {
  const { credential, userInfo, isDemo } = req.body;

  try {
    let email = '';
    let name = '';
    let googleId = '';
    let avatar = '';

    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          name = payload.name;
          googleId = payload.sub;
          avatar = payload.picture || '';
        } else {
          console.warn('⚠️ Google tokeninfo verification failed, checking payload data');
        }
      } catch (err) {
        console.warn('⚠️ Error calling Google tokeninfo:', err.message);
      }
    }

    // Fallback for development/demo or direct userInfo
    if (!email && (userInfo || isDemo)) {
      email = userInfo?.email || req.body.email;
      name = userInfo?.name || req.body.name || 'Google User';
      googleId = userInfo?.sub || userInfo?.id || req.body.googleId || `google-demo-${Date.now()}`;
      avatar = userInfo?.picture || req.body.avatar || '';
    }

    if (!email) {
      return res.status(400).json({ error: 'Google authentication failed. No valid email received.' });
    }

    email = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated.' });
      }
      if (!user.googleId && googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      console.log(`✅ Google sign-in successful for existing user: ${email}`);
    } else {
      // New user registration via Google
      user = new User({
        name: name || 'Google User',
        email,
        phone: req.body.phone || '',
        googleId,
        avatar,
        authProvider: 'google',
        role: 'patient',
      });
      await user.save();
      console.log(`✅ New user registered via Google: ${email}`);

      // Send welcome notification if configured
      sendWelcomeNotification(user).catch((err) => console.error('Welcome notification error:', err.message));
    }

    const token = generateToken(user._id);

    // Send login alert
    sendLoginNotification(user).catch((err) => console.error('Login notification error:', err.message));

    res.json({
      message: 'Google authentication successful',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Server error during Google authentication.', detail: err.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get current user
// @access Private
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// @route  PUT /api/auth/update-fcm-token
// @desc   Update Firebase Cloud Messaging token
// @access Private
router.put('/update-fcm-token', auth, async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) {
    return res.status(400).json({ error: 'FCM token is required.' });
  }
  try {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { fcmTokens: fcmToken } });
    res.json({ message: 'FCM token registered.' });
  } catch (err) {
    res.status(500).json({ error: '💥 CRASH IN UPDATE FCM 💥', details: err.message });
  }
});

// @route  PUT /api/auth/profile
// @desc   Update user profile
// @access Private
router.put('/profile', auth, async (req, res) => {
  try {
    const update = {};
    // Plain text fields: only update when provided.
    ['name', 'phone'].forEach((key) => {
      if (typeof req.body[key] === 'string' && req.body[key].trim()) update[key] = req.body[key].trim();
    });
    // Optional fields: an empty string clears the value.
    ['dateOfBirth', 'gender', 'bloodGroup'].forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key] || null;
    });

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });
    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0]?.message || 'Invalid profile data.' });
    }
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

module.exports = router;
