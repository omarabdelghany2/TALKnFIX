const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4173;

console.log(`Starting server on port ${PORT}...`);
console.log(`Current directory: ${__dirname}`);

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error(`ERROR: dist folder not found at ${distPath}`);
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`ERROR: index.html not found at ${indexPath}`);
  process.exit(1);
}

console.log(`✓ Found dist folder at ${distPath}`);
console.log(`✓ Found index.html at ${indexPath}`);

// Serve static files from the dist directory
app.use(express.static(distPath));

// Handle all routes by serving index.html (SPA support)
app.get('*', (req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error serving file: ${err.message}`);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Error handling
app.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server is running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Serving files from: ${distPath}`);
  console.log(`✓ Ready to accept connections`);
});

server.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
