const express = require('express');
const router = express.Router();
const {
  toggleReaction,
  getReactions,
  checkReaction
} = require('../controllers/reactionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', toggleReaction);
router.get('/:postId', getReactions);
router.get('/:postId/check', checkReaction);

module.exports = router;
