const User = require('../models/User');
const REPUTATION_POINTS = require('../config/reputationRules');
const BADGES = require('../config/badges');

/**
 * Update user's reputation based on an action
 * @param {String} userId - User ID to update
 * @param {String} action - Action type from REPUTATION_POINTS
 * @returns {Object} Updated user object
 */
const updateReputation = async (userId, action) => {
  try {
    const points = REPUTATION_POINTS[action] || 0;

    if (points === 0) {
      console.log(`No reputation change for action: ${action}`);
      return null;
    }

    const user = await User.findById(userId);

    if (!user) {
      console.error(`User not found: ${userId}`);
      return null;
    }

    // Update reputation
    user.reputation += points;

    // Ensure reputation doesn't go below 0
    if (user.reputation < 0) {
      user.reputation = 0;
    }

    // Update level based on reputation (1 level per 100 points)
    user.level = Math.floor(user.reputation / 100) + 1;

    await user.save();

    // Check for new badges after reputation update
    await checkAndAwardBadges(user);

    return user;
  } catch (error) {
    console.error('Error updating reputation:', error);
    throw error;
  }
};

/**
 * Check if user qualifies for any new badges and award them
 * @param {Object} user - User object to check
 * @returns {Array} Array of newly awarded badges
 */
const checkAndAwardBadges = async (user) => {
  try {
    const newBadges = [];

    for (const [key, badge] of Object.entries(BADGES)) {
      // Check if user already has this badge
      const hasBadge = user.badges.some(b => b.badgeId === badge.id);

      // If user doesn't have badge and meets condition, award it
      if (!hasBadge && badge.condition(user)) {
        user.badges.push({
          badgeId: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earnedAt: new Date()
        });

        newBadges.push(badge);

        console.log(`Badge awarded to ${user.username}: ${badge.name}`);
      }
    }

    // Save user if new badges were awarded
    if (newBadges.length > 0) {
      await user.save();
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking/awarding badges:', error);
    throw error;
  }
};

/**
 * Update user statistics
 * @param {String} userId - User ID to update
 * @param {String} statType - Type of stat (totalPosts, totalComments, etc.)
 * @param {Number} increment - Amount to increment (default: 1, can be negative)
 * @returns {Object} Updated user object
 */
const updateStats = async (userId, statType, increment = 1) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { [`stats.${statType}`]: increment }
      },
      { new: true }
    );

    if (!user) {
      console.error(`User not found: ${userId}`);
      return null;
    }

    // Check for new badges after stats update
    await checkAndAwardBadges(user);

    return user;
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
};

/**
 * Get user's reputation details
 * @param {String} userId - User ID
 * @returns {Object} Reputation details
 */
const getReputationDetails = async (userId) => {
  try {
    const user = await User.findById(userId).select('reputation level badges stats');

    if (!user) {
      return null;
    }

    // Calculate progress to next level
    const currentLevelReputation = (user.level - 1) * 100;
    const nextLevelReputation = user.level * 100;
    const progressToNextLevel = user.reputation - currentLevelReputation;
    const progressPercentage = (progressToNextLevel / 100) * 100;

    return {
      reputation: user.reputation,
      level: user.level,
      badges: user.badges,
      stats: user.stats,
      nextLevel: {
        level: user.level + 1,
        reputationNeeded: nextLevelReputation - user.reputation,
        progressPercentage: Math.min(progressPercentage, 100)
      }
    };
  } catch (error) {
    console.error('Error getting reputation details:', error);
    throw error;
  }
};

module.exports = {
  updateReputation,
  checkAndAwardBadges,
  updateStats,
  getReputationDetails
};
