const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  hidePost,
  unhidePost,
  getUserPosts,
  searchPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Post CRUD
router.post('/', upload.array('images', 5), createPost);
router.get('/feed', getFeed);
router.get('/search', searchPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Hide/unhide posts
router.post('/:id/hide', hidePost);
router.post('/:id/unhide', unhidePost);

module.exports = router;
