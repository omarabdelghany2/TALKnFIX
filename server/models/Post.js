const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  contentType: {
    type: String,
    enum: ['html', 'json', 'markdown', 'text'],
    default: 'html'
  },
  images: [{
    type: String
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true
  }],
  reactionsCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, reactionsCount: -1, commentsCount: -1 });
// Text index for search functionality
postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
