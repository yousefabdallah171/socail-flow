#!/bin/bash

# SocialFlow Production Startup Script

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-3000}

# Create logs directory
mkdir -p logs

# Start the application
if command -v pm2 >/dev/null 2>&1; then
    echo "Starting with PM2..."
    pm2 start ecosystem.config.js
else
    echo "Starting with npm..."
    npm start
fi