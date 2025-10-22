const Reaction = require('../models/Reaction');
const Post = require('../models/Post');

// @desc    Toggle reaction on a post
// @route   POST /api/reactions
// @access  Private
exports.toggleReaction = async (req, res) => {
  try {
    const { postId, type } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already reacted
    const existingReaction = await Reaction.findOne({
      post: postId,
      user: req.user.id
    });

    if (existingReaction) {
      // If same type, remove reaction (toggle off)
      if (existingReaction.type === type) {
        await existingReaction.deleteOne();

        // Decrement post's reaction count
        post.reactionsCount = Math.max(0, post.reactionsCount - 1);
        await post.save();

        return res.json({
          success: true,
          message: 'Reaction removed',
          reacted: false
        });
      } else {
        // If different type, update reaction
        existingReaction.type = type;
        await existingReaction.save();

        return res.json({
          success: true,
          message: 'Reaction updated',
          reacted: true,
          reaction: existingReaction
        });
      }
    }

    // Create new reaction
    const reaction = await Reaction.create({
      post: postId,
      user: req.user.id,
      type: type || 'like'
    });

    // Increment post's reaction count
    post.reactionsCount += 1;
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Reaction added',
      reacted: true,
      reaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reactions for a post
// @route   GET /api/reactions/:postId
// @access  Private
exports.getReactions = async (req, res) => {
  try {
    const reactions = await Reaction.find({ post: req.params.postId })
      .populate('user', 'username fullName avatar');

    // Group by type
    const grouped = reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      total: reactions.length,
      byType: grouped,
      reactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if user reacted to a post
// @route   GET /api/reactions/:postId/check
// @access  Private
exports.checkReaction = async (req, res) => {
  try {
    const reaction = await Reaction.findOne({
      post: req.params.postId,
      user: req.user.id
    });

    res.json({
      success: true,
      reacted: !!reaction,
      reaction: reaction || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
