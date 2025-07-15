#!/bin/bash
# One-Command Fix for Google Analytics
# Quick fix script that does everything needed

echo "🚀 One-Command Google Analytics Fix"
echo "=================================="

set -e  # Exit on any error

# Navigate to frontend
cd /srv/sydneyscheduler/frontend

# Create .env with GA ID
echo "REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7" > .env
echo "REACT_APP_API_URL=https://sydneyscheduler.com" >> .env

# Build with environment variables
echo "🏗️ Building frontend..."
REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7 npm run build

# Find nginx document root
if [ -f "/etc/nginx/sites-enabled/webscraper" ]; then
    DOC_ROOT=$(grep "root" /etc/nginx/sites-enabled/webscraper | head -1 | awk '{print $2}' | sed 's/;//')
elif [ -f "/etc/nginx/sites-enabled/sydneyscheduler" ]; then
    DOC_ROOT=$(grep "root" /etc/nginx/sites-enabled/sydneyscheduler | head -1 | awk '{print $2}' | sed 's/;//')
fi

# Deploy files
if [ -n "$DOC_ROOT" ]; then
    echo "📁 Deploying to $DOC_ROOT..."
    sudo cp -r build/* "$DOC_ROOT/"
    sudo chown -R www-data:www-data "$DOC_ROOT"
    sudo chmod -R 755 "$DOC_ROOT"
fi

# Restart nginx
sudo systemctl restart nginx

echo "✅ DONE! Check https://sydneyscheduler.com/"
echo "Console should show: Google Analytics initialized with ID: G-DMDYBF56W7"
