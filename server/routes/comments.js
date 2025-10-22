const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', createComment);
router.get('/:postId', getComments);
router.delete('/:id', deleteComment);

module.exports = router;
