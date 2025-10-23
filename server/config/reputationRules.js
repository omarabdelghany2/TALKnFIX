// Reputation point values for different actions
const REPUTATION_POINTS = {
  // Post actions
  POST_CREATED: 5,
  POST_DELETED: -5,
  POST_UPDATED: 0,

  // Comment actions
  COMMENT_CREATED: 2,
  COMMENT_DELETED: -2,

  // Receiving reactions (post author gains points)
  RECEIVE_LIKE: 1,
  RECEIVE_UPVOTE: 5,
  RECEIVE_HELPFUL: 10,
  RECEIVE_INSIGHTFUL: 10,

  // Removing reactions (post author loses points)
  LOSE_LIKE: -1,
  LOSE_UPVOTE: -5,
  LOSE_HELPFUL: -10,
  LOSE_INSIGHTFUL: -10,

  // Answer acceptance
  ANSWER_ACCEPTED: 15,
  ANSWER_UNACCEPTED: -15,

  // Social actions
  FRIEND_REQUEST_ACCEPTED: 3,

  // Engagement bonuses
  DAILY_LOGIN: 1
};

module.exports = REPUTATION_POINTS;
