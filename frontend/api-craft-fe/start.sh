#!/bin/sh
# Start script for Railway deployment
# Uses Railway's PORT environment variable or defaults to 4173

# Debug: Show what PORT Railway is providing
echo "DEBUG: Railway PORT variable = '$PORT'"

# Use Railway PORT if set, otherwise use 4173
if [ -z "$PORT" ]; then
  echo "WARNING: PORT not set by Railway, using default 4173"
  VITE_PORT=4173
else
  echo "SUCCESS: Using Railway PORT $PORT"
  VITE_PORT=$PORT
fi

echo "Starting Vite preview server on port $VITE_PORT..."
exec npx vite preview --host 0.0.0.0 --port $VITE_PORT
