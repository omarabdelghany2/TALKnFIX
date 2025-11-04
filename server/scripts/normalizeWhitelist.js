const mongoose = require('mongoose');
const Whitelist = require('../models/Whitelist');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Normalize all whitelist entries to lowercase
async function normalizeWhitelist() {
  try {
    console.log('Starting whitelist normalization...');

    // Get all whitelist entries
    const entries = await Whitelist.find({});
    console.log(`Found ${entries.length} whitelist entries`);

    let updatedCount = 0;

    for (const entry of entries) {
      const originalEmail = entry.email;
      const lowercaseEmail = originalEmail.toLowerCase();

      if (originalEmail !== lowercaseEmail) {
        console.log(`Updating: ${originalEmail} -> ${lowercaseEmail}`);
        entry.email = lowercaseEmail;
        await entry.save();
        updatedCount++;
      }
    }

    console.log(`\nNormalization complete!`);
    console.log(`Updated ${updatedCount} entries`);
    console.log(`${entries.length - updatedCount} entries were already lowercase`);

    process.exit(0);
  } catch (error) {
    console.error('Error normalizing whitelist:', error);
    process.exit(1);
  }
}

normalizeWhitelist();
