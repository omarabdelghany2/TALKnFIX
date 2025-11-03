const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const Post = require('../models/Post');

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'uploads';

async function cleanupMissingImages() {
  try {
    console.log('Starting cleanup of posts with missing images...\n');

    // Get all posts with images
    const posts = await Post.find({ images: { $exists: true, $ne: [] } });
    console.log(`Found ${posts.length} posts with images\n`);

    let updatedCount = 0;
    let totalRemoved = 0;

    for (const post of posts) {
      const existingImages = [];
      const missingImages = [];

      // Check each image
      for (const imageUrl of post.images) {
        // Extract filename from URL (e.g., /uploads/images-123.png -> images-123.png)
        const filename = imageUrl.replace('/uploads/', '');
        const filePath = path.join(UPLOAD_PATH, filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
          existingImages.push(imageUrl);
        } else {
          missingImages.push(imageUrl);
        }
      }

      // Update post if any images are missing
      if (missingImages.length > 0) {
        console.log(`Post ${post._id}:`);
        console.log(`  - Removing ${missingImages.length} missing image(s)`);
        console.log(`  - Keeping ${existingImages.length} existing image(s)`);

        post.images = existingImages;
        await post.save();

        updatedCount++;
        totalRemoved += missingImages.length;
      }
    }

    console.log('\n=== Cleanup Complete ===');
    console.log(`Posts updated: ${updatedCount}`);
    console.log(`Total images removed: ${totalRemoved}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
    mongoose.connection.close();
  }
}

cleanupMissingImages();
