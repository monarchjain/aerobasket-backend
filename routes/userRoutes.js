const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.post('/profile/photo', protect, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadProfilePhoto);

module.exports = router;