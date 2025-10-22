const express = require('express');
const router = express.Router();
const { register, login, getMe, updateLanguage } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/language', protect, updateLanguage);

module.exports = router;
