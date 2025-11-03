const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendRequests,
  searchUsers,
  getLeaderboard,
  getUserReputation,
  getUserBadges,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/search', searchUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/friend-requests', getFriendRequests);
router.get('/:id', getUserProfile);
router.get('/:id/reputation', getUserReputation);
router.get('/:id/badges', getUserBadges);
router.post('/:id/friend-request', sendFriendRequest);
router.post('/friend-request/:requestId/accept', acceptFriendRequest);
router.post('/friend-request/:requestId/reject', rejectFriendRequest);
router.delete('/:id/friend', removeFriend);
router.delete('/:id', deleteUser);

module.exports = router;
