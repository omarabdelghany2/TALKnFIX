const User = require('../models/User');
const { getReputationDetails } = require('../services/reputationService');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username fullName avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send friend request
// @route   POST /api/users/:id/friend-request
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends'
      });
    }

    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
      r => r.from.toString() === req.user.id
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Add friend request
    targetUser.friendRequests.push({ from: req.user.id });
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept friend request
// @route   POST /api/users/friend-request/:requestId/accept
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendId = req.params.requestId;

    // Find the request
    const requestIndex = user.friendRequests.findIndex(
      r => r.from.toString() === friendId
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Remove the request
    user.friendRequests.splice(requestIndex, 1);

    // Add to friends
    user.friends.push(friendId);
    await user.save();

    // Add current user to friend's friend list
    const friend = await User.findById(friendId);
    friend.friends.push(req.user.id);
    await friend.save();

    res.json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject friend request
// @route   POST /api/users/friend-request/:requestId/reject
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendId = req.params.requestId;

    // Remove the request
    user.friendRequests = user.friendRequests.filter(
      r => r.from.toString() !== friendId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Friend request rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove friend
// @route   DELETE /api/users/:id/friend
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendId = req.params.id;

    // Remove from current user's friends
    user.friends = user.friends.filter(
      id => id.toString() !== friendId
    );
    await user.save();

    // Remove current user from friend's friend list
    const friend = await User.findById(friendId);
    if (friend) {
      friend.friends = friend.friends.filter(
        id => id.toString() !== req.user.id
      );
      await friend.save();
    }

    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get friend requests
// @route   GET /api/users/friend-requests
// @access  Private
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.from', 'username fullName avatar');

    res.json({
      success: true,
      requests: user.friendRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username fullName avatar')
      .limit(20);

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const users = await User.find()
      .select('username fullName avatar reputation level badges stats')
      .sort({ reputation: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user reputation details
// @route   GET /api/users/:id/reputation
// @access  Private
exports.getUserReputation = async (req, res) => {
  try {
    const details = await getReputationDetails(req.params.id);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      reputation: details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user badges
// @route   GET /api/users/:id/badges
// @access  Private
exports.getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('badges');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      count: user.badges.length,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
