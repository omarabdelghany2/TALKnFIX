const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Reaction = require('../models/Reaction');
const { updateReputation, updateStats } = require('../services/reputationService');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, visibility, tags } = req.body;

    // Create post
    const post = await Post.create({
      author: req.user.id,
      title,
      content,
      visibility: visibility || 'public',
      tags: tags || [],
      images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username fullName avatar');

    // Award reputation and update stats
    await updateReputation(req.user.id, 'POST_CREATED');
    await updateStats(req.user.id, 'totalPosts');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all posts for timeline/feed (with pagination)
// @route   GET /api/posts/feed?page=1&limit=10
// @access  Private
exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Ensure arrays exist
    const hiddenPosts = user.hiddenPosts || [];
    const friends = user.friends || [];

    // Build query
    const query = {
      _id: { $nin: hiddenPosts },
      $or: [
        { visibility: 'public' },
        { visibility: 'private', author: { $in: friends } },
        { author: req.user.id } // Show all your own posts
      ]
    };

    // Get total count for pagination metadata
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    // Get posts that are:
    // 1. Public posts
    // 2. Private posts from friends
    // 3. Your own posts (both public and private)
    // Exclude hidden posts
    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip(skip)
      .limit(limit);

    // Filter out posts where author failed to populate (deleted users, etc.)
    const validPosts = posts.filter(post => post.author !== null);

    // Add user's reaction to each post
    const postsWithReactions = await Promise.all(
      validPosts.map(async (post) => {
        const reaction = await Reaction.findOne({
          post: post._id,
          user: req.user.id
        });

        return {
          ...post.toObject(),
          userReaction: reaction ? reaction.type : null
        };
      })
    );

    res.json({
      success: true,
      posts: postsWithReactions,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        postsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check visibility permissions
    const user = await User.findById(req.user.id);

    if (post.visibility === 'private' &&
        post.author._id.toString() !== req.user.id &&
        !user.friends.includes(post.author._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this post'
      });
    }

    // Add user's reaction to the post
    const reaction = await Reaction.findOne({
      post: post._id,
      user: req.user.id
    });

    const postWithReaction = {
      ...post.toObject(),
      userReaction: reaction ? reaction.type : null
    };

    res.json({
      success: true,
      post: postWithReaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Handle tags (support both tags and tags[] from FormData)
    let tags = [];
    if (req.body['tags[]']) {
      tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    } else if (req.body.tags) {
      tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    }

    // Handle image updates
    let images = [];

    // Keep existing images if provided (support existingImages[] from FormData)
    const existingImagesKey = req.body['existingImages[]'] || req.body.existingImages;
    if (existingImagesKey) {
      if (Array.isArray(existingImagesKey)) {
        images = existingImagesKey;
      } else {
        images = [existingImagesKey];
      }
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    // Prepare update data
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      visibility: req.body.visibility,
      tags: tags,
      images: images
    };

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'username fullName avatar');

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    // Deduct reputation and update stats
    await updateReputation(req.user.id, 'POST_DELETED');
    await updateStats(req.user.id, 'totalPosts', -1);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Hide post from feed
// @route   POST /api/posts/:id/hide
// @access  Private
exports.hidePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.hiddenPosts.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Post already hidden'
      });
    }

    user.hiddenPosts.push(req.params.id);
    await user.save();

    res.json({
      success: true,
      message: 'Post hidden from your feed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unhide post
// @route   POST /api/posts/:id/unhide
// @access  Private
exports.unhidePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.hiddenPosts = user.hiddenPosts.filter(
      postId => postId.toString() !== req.params.id
    );
    await user.save();

    res.json({
      success: true,
      message: 'Post unhidden'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Private
exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetUserId = req.params.userId;

    // If viewing own profile, show all posts
    // If viewing friend's profile, show public + private
    // If not friend, show only public
    let query = { author: targetUserId };

    if (targetUserId !== req.user.id && !user.friends.includes(targetUserId)) {
      query.visibility = 'public';
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 });

    // Filter out posts where author failed to populate
    const validPosts = posts.filter(post => post.author !== null);

    // Add user's reaction to each post
    const postsWithReactions = await Promise.all(
      validPosts.map(async (post) => {
        const reaction = await Reaction.findOne({
          post: post._id,
          user: req.user.id
        });

        return {
          ...post.toObject(),
          userReaction: reaction ? reaction.type : null
        };
      })
    );

    // Calculate total stats
    const stats = await Post.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(targetUserId) } },
      {
        $group: {
          _id: null,
          totalReactions: { $sum: '$reactionsCount' },
          totalComments: { $sum: '$commentsCount' }
        }
      }
    ]);

    res.json({
      success: true,
      count: postsWithReactions.length,
      posts: postsWithReactions,
      stats: stats[0] || { totalReactions: 0, totalComments: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search posts with filters
// @route   GET /api/posts/search
// @access  Private
exports.searchPosts = async (req, res) => {
  try {
    const { q, tags, author, sortBy, dateFrom, dateTo, minReactions } = req.query;

    let query = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Tag filtering (case-insensitive)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      // Use regex for case-insensitive tag matching
      query.tags = {
        $in: tagArray.map(tag => new RegExp(`^${tag}$`, 'i'))
      };
    }

    // Author filtering (case-insensitive)
    if (author) {
      const user = await User.findOne({
        username: { $regex: new RegExp(`^${author}$`, 'i') }
      });
      if (user) {
        query.author = user._id;
      }
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Reaction count filtering
    if (minReactions) {
      query.reactionsCount = { $gte: parseInt(minReactions) };
    }

    // Visibility filter - only show public posts or user's own posts
    const user = await User.findById(req.user.id);
    query.$or = [
      { visibility: 'public' },
      { visibility: 'private', author: { $in: user.friends } },
      { author: req.user.id }
    ];

    // Sorting
    let sort = {};
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (sortBy === 'mostReactions') {
      sort = { reactionsCount: -1 };
    } else if (sortBy === 'mostComments') {
      sort = { commentsCount: -1 };
    } else if (q && sortBy === 'relevance') {
      // Text score for relevance sorting
      sort = { score: { $meta: 'textScore' } };
      query = { ...query, score: { $meta: 'textScore' } };
    } else {
      sort = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort(sort)
      .limit(50);

    // Filter out posts where author failed to populate
    const validPosts = posts.filter(post => post.author !== null);

    // Add user's reaction to each post
    const postsWithReactions = await Promise.all(
      validPosts.map(async (post) => {
        const reaction = await Reaction.findOne({
          post: post._id,
          user: req.user.id
        });

        return {
          ...post.toObject(),
          userReaction: reaction ? reaction.type : null
        };
      })
    );

    res.json({
      success: true,
      count: postsWithReactions.length,
      posts: postsWithReactions,
      filters: {
        q,
        tags,
        author,
        sortBy,
        dateFrom,
        dateTo,
        minReactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
