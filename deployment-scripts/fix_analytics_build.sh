#!/bin/bash
# Fix Google Analytics Production Build
# Run this on your DigitalOcean server

echo "🔧 Fixing Google Analytics Production Build"
echo "=========================================="

# Check current user and location
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo ""

# Navigate to the project directory
echo "1. Navigating to project directory..."
cd /srv/sydneyscheduler || {
    echo "❌ Cannot find project at /srv/sydneyscheduler"
    echo "Checking alternative locations..."
    find /srv -name "frontend" -type d 2>/dev/null | head -5
    exit 1
}

echo "✅ In project directory: $(pwd)"
echo ""

# Check frontend directory
echo "2. Checking frontend directory..."
if [ -d "frontend" ]; then
    echo "✅ Frontend directory found"
    cd frontend
else
    echo "❌ Frontend directory not found"
    ls -la
    exit 1
fi

echo ""

# Backup existing .env if it exists
echo "3. Setting up environment file..."
if [ -f ".env" ]; then
    echo "📁 Backing up existing .env"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create/update .env file with correct GA ID
echo "📝 Creating production .env file..."
cat > .env << 'EOF'
# Production Environment Variables
# Google Analytics 4 Measurement ID
REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7

# API URL (production)
REACT_APP_API_URL=https://sydneyscheduler.com
EOF

echo "✅ Environment file created:"
cat .env
echo ""

# Verify Node.js and npm are available
echo "4. Checking Node.js environment..."
echo "Node version: $(node --version 2>/dev/null || echo 'Not found')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not found')"

if ! command -v npm > /dev/null; then
    echo "❌ npm not found. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo ""

# Install dependencies if needed
echo "5. Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Clean previous build
echo "6. Cleaning previous build..."
if [ -d "build" ]; then
    echo "🗑️  Removing old build directory"
    rm -rf build
fi

echo ""

# Build with environment variables
echo "7. Building production frontend with GA..."
echo "🏗️  Running npm run build..."

# Set environment variables explicitly and build
REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7 REACT_APP_API_URL=https://sydneyscheduler.com npm run build

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo "Build output above should show the error"
    exit 1
fi

echo ""

# Verify GA ID is in built files
echo "8. Verifying GA integration in build..."
if [ -d "build" ]; then
    if grep -r "G-DMDYBF56W7" build/ > /dev/null 2>&1; then
        echo "✅ GA measurement ID found in built files!"
        echo "Files containing GA ID:"
        grep -r "G-DMDYBF56W7" build/ | head -3
    else
        echo "❌ GA measurement ID NOT found in built files"
        echo "This indicates the environment variable wasn't picked up during build"
        
        # Check if the analytics.js file exists and what it contains
        echo ""
        echo "Checking built analytics files..."
        find build/ -name "*.js" -exec grep -l "analytics\|gtag" {} \; | head -3
    fi
else
    echo "❌ Build directory not created"
    exit 1
fi

echo ""

# Check nginx document root and copy files
echo "9. Deploying to nginx..."

# Find nginx config
NGINX_CONFIG=""
if [ -f "/etc/nginx/sites-enabled/webscraper" ]; then
    NGINX_CONFIG="/etc/nginx/sites-enabled/webscraper"
elif [ -f "/etc/nginx/sites-enabled/sydneyscheduler" ]; then
    NGINX_CONFIG="/etc/nginx/sites-enabled/sydneyscheduler"
else
    echo "❌ Nginx config not found. Checking available configs:"
    ls -la /etc/nginx/sites-enabled/
fi

if [ -n "$NGINX_CONFIG" ]; then
    echo "✅ Found nginx config: $NGINX_CONFIG"
    
    # Extract document root
    DOC_ROOT=$(grep "root" "$NGINX_CONFIG" | head -1 | awk '{print $2}' | sed 's/;//')
    echo "Document root: $DOC_ROOT"
    
    if [ -n "$DOC_ROOT" ] && [ -d "$DOC_ROOT" ]; then
        echo "📁 Copying build files to nginx document root..."
        sudo cp -r build/* "$DOC_ROOT/"
        
        # Fix permissions
        echo "🔐 Setting permissions..."
        sudo chown -R www-data:www-data "$DOC_ROOT"
        sudo chmod -R 755 "$DOC_ROOT"
        
        echo "✅ Files deployed to $DOC_ROOT"
    else
        echo "❌ Invalid document root: $DOC_ROOT"
    fi
fi

echo ""

# Restart nginx
echo "10. Restarting nginx..."
sudo systemctl restart nginx

if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx restarted successfully"
else
    echo "❌ Nginx restart failed"
    sudo systemctl status nginx --no-pager
fi

echo ""

# Test the deployment
echo "11. Testing deployment..."
echo "🌐 Testing live site..."

# Wait a moment for nginx to fully restart
sleep 2

# Test site accessibility
SITE_STATUS=$(curl -s -w "%{http_code}" https://sydneyscheduler.com/ -o /tmp/site_test.html)
echo "Site HTTP status: $SITE_STATUS"

if [ "$SITE_STATUS" = "200" ]; then
    echo "✅ Site is accessible"
    
    # Check for GA in the HTML
    if grep -q "G-DMDYBF56W7" /tmp/site_test.html; then
        echo "✅ GA measurement ID found in live site!"
    else
        echo "❌ GA measurement ID still not found in live site"
        echo "Checking what's in the HTML..."
        grep -i "analytics\|gtag\|google" /tmp/site_test.html | head -3
    fi
    
    if grep -q "googletagmanager.com" /tmp/site_test.html; then
        echo "✅ Google Analytics script tag found!"
    else
        echo "❌ Google Analytics script tag not found"
    fi
else
    echo "❌ Site not accessible (HTTP $SITE_STATUS)"
fi

# Clean up
rm -f /tmp/site_test.html

echo ""

# Final verification
echo "12. Final verification steps:"
echo "============================"
echo ""
echo "✅ BUILD COMPLETE!"
echo ""
echo "🔍 Next steps to verify:"
echo "1. Visit: https://sydneyscheduler.com/"
echo "2. Open browser console (F12)"
echo "3. Look for: 'Google Analytics initialized with ID: G-DMDYBF56W7'"
echo "4. Run this in console to test:"
echo "   gtag('event', 'test_after_rebuild', {event_category: 'Test', value: 1})"
echo ""
echo "5. Check GA Real-Time dashboard:"
echo "   https://analytics.google.com/analytics/web/#/p417946779/realtime/overview"
echo ""
echo "6. If still no data, run browser debug:"
echo "   Copy/paste debug-live-analytics.js into console"
echo ""

# Show build summary
echo "📊 Build Summary:"
echo "=================="
echo "✅ Environment file created with GA ID"
echo "✅ Frontend built with environment variables"
if grep -r "G-DMDYBF56W7" build/ > /dev/null 2>&1; then
    echo "✅ GA ID included in build files"
else
    echo "❌ GA ID missing from build files"
fi
echo "✅ Files deployed to nginx"
echo "✅ Nginx restarted"

echo ""
echo "🎯 If analytics still don't work:"
echo "1. Check browser console for errors"
echo "2. Disable ad blockers"
echo "3. Test in incognito mode"
echo "4. Wait 2-5 minutes for data to appear"
echo "5. Verify data stream setup in GA dashboard"
