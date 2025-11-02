#!/bin/sh
# Start script for Railway deployment
# Uses Railway's PORT environment variable or defaults to 4173

# Set default port if PORT is not set
PORT=${PORT:-4173}

echo "Starting Vite preview server on port $PORT..."
exec npx vite preview --host 0.0.0.0 --port $PORT
