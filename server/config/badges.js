// Badge definitions and conditions for awarding badges
const BADGES = {
  FIRST_POST: {
    id: 'first-post',
    name: 'First Steps',
    description: 'Created your first post',
    icon: '🎯',
    condition: (user) => user.stats.totalPosts >= 1
  },
  PROLIFIC_POSTER: {
    id: 'prolific-poster',
    name: 'Prolific Poster',
    description: 'Created 10 posts',
    icon: '📝',
    condition: (user) => user.stats.totalPosts >= 10
  },
  CONTENT_CREATOR: {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Created 50 posts',
    icon: '✍️',
    condition: (user) => user.stats.totalPosts >= 50
  },
  FIRST_COMMENT: {
    id: 'first-comment',
    name: 'Breaking the Ice',
    description: 'Posted your first comment',
    icon: '💭',
    condition: (user) => user.stats.totalComments >= 1
  },
  ACTIVE_COMMENTER: {
    id: 'active-commenter',
    name: 'Conversationalist',
    description: 'Posted 50 comments',
    icon: '💬',
    condition: (user) => user.stats.totalComments >= 50
  },
  DISCUSSION_MASTER: {
    id: 'discussion-master',
    name: 'Discussion Master',
    description: 'Posted 200 comments',
    icon: '🗣️',
    condition: (user) => user.stats.totalComments >= 200
  },
  HELPFUL_10: {
    id: 'helpful-10',
    name: 'Helper',
    description: 'Received 10 helpful reactions',
    icon: '🌟',
    condition: (user) => user.stats.helpfulReactionsReceived >= 10
  },
  HELPFUL_50: {
    id: 'helpful-50',
    name: 'Super Helper',
    description: 'Received 50 helpful reactions',
    icon: '⭐',
    condition: (user) => user.stats.helpfulReactionsReceived >= 50
  },
  HELPFUL_100: {
    id: 'helpful-100',
    name: 'Hero',
    description: 'Received 100 helpful reactions',
    icon: '🦸',
    condition: (user) => user.stats.helpfulReactionsReceived >= 100
  },
  POPULAR_CREATOR: {
    id: 'popular-creator',
    name: 'Popular Creator',
    description: 'Received 100 total reactions',
    icon: '🔥',
    condition: (user) => user.stats.totalReactionsReceived >= 100
  },
  VIRAL: {
    id: 'viral',
    name: 'Viral',
    description: 'Received 500 total reactions',
    icon: '🚀',
    condition: (user) => user.stats.totalReactionsReceived >= 500
  },
  PROBLEM_SOLVER: {
    id: 'problem-solver',
    name: 'Problem Solver',
    description: 'Had 10 accepted answers',
    icon: '✅',
    condition: (user) => user.stats.acceptedAnswers >= 10
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert',
    description: 'Had 50 accepted answers',
    icon: '🎓',
    condition: (user) => user.stats.acceptedAnswers >= 50
  },
  REPUTATION_100: {
    id: 'reputation-100',
    name: 'Rising Star',
    description: 'Reached 100 reputation points',
    icon: '🌠',
    condition: (user) => user.reputation >= 100
  },
  REPUTATION_500: {
    id: 'reputation-500',
    name: 'Influencer',
    description: 'Reached 500 reputation points',
    icon: '💎',
    condition: (user) => user.reputation >= 500
  },
  REPUTATION_1000: {
    id: 'reputation-1000',
    name: 'Legend',
    description: 'Reached 1000 reputation points',
    icon: '👑',
    condition: (user) => user.reputation >= 1000
  }
};

module.exports = BADGES;
