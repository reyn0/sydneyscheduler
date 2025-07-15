#!/bin/bash
# Verify Production Google Analytics Setup
# Run this on your DigitalOcean server

echo "🔍 Verifying Production Google Analytics Setup"
echo "============================================="

# Check if frontend .env exists
echo "1. Checking production environment file..."
if [ -f "/srv/sydneyscheduler/frontend/.env" ]; then
    echo "✅ Production .env found"
    echo "Contents:"
    cat /srv/sydneyscheduler/frontend/.env
    echo ""
    
    # Check if GA ID is set
    GA_ID=$(grep "REACT_APP_GA_MEASUREMENT_ID" /srv/sydneyscheduler/frontend/.env | cut -d'=' -f2)
    if [ "$GA_ID" = "G-DMDYBF56W7" ]; then
        echo "✅ Correct GA measurement ID found: $GA_ID"
    else
        echo "❌ GA measurement ID issue. Found: $GA_ID, Expected: G-DMDYBF56W7"
    fi
else
    echo "❌ Production .env not found at /srv/sydneyscheduler/frontend/.env"
    echo "Create it with:"
    echo "REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7"
fi

echo ""

# Check if build directory has the analytics code
echo "2. Checking built frontend files..."
if [ -d "/srv/sydneyscheduler/frontend/build" ]; then
    echo "✅ Build directory exists"
    
    # Check if built files contain the GA ID
    if grep -r "G-DMDYBF56W7" /srv/sydneyscheduler/frontend/build/ > /dev/null 2>&1; then
        echo "✅ GA measurement ID found in built files"
        echo "Files containing GA ID:"
        grep -r "G-DMDYBF56W7" /srv/sydneyscheduler/frontend/build/ | head -3
    else
        echo "❌ GA measurement ID NOT found in built files"
        echo "This means the build didn't include your .env variables"
        echo "You need to rebuild with the correct .env file"
    fi
else
    echo "❌ Build directory not found"
fi

echo ""

# Check nginx configuration
echo "3. Checking nginx configuration..."
if [ -f "/etc/nginx/sites-enabled/webscraper" ]; then
    echo "✅ Nginx config found"
    echo "Document root:"
    grep "root" /etc/nginx/sites-enabled/webscraper | head -1
else
    echo "❌ Nginx config not found at /etc/nginx/sites-enabled/webscraper"
    echo "Checking alternative locations..."
    ls -la /etc/nginx/sites-enabled/ | grep -E "(webscraper|sydney)"
fi

echo ""

# Test the live site
echo "4. Testing live site..."
echo "Checking if site is accessible..."
curl -s -I https://sydneyscheduler.com/ | head -5

echo ""
echo "Checking for GA script in HTML..."
SITE_HTML=$(curl -s https://sydneyscheduler.com/)
if echo "$SITE_HTML" | grep -q "googletagmanager.com"; then
    echo "✅ Google Analytics script found in HTML"
    echo "GA script references:"
    echo "$SITE_HTML" | grep -o "googletagmanager.com[^\"']*" | head -2
else
    echo "❌ Google Analytics script NOT found in HTML"
fi

echo ""
if echo "$SITE_HTML" | grep -q "G-DMDYBF56W7"; then
    echo "✅ Measurement ID found in HTML source"
else
    echo "❌ Measurement ID NOT found in HTML source"
fi

echo ""

# Check if analytics.js is accessible
echo "5. Checking analytics file..."
if echo "$SITE_HTML" | grep -o "static/js/[^\"']*\.js" | head -1 > /tmp/js_file.txt; then
    JS_FILE=$(cat /tmp/js_file.txt)
    echo "Main JS file: $JS_FILE"
    
    JS_CONTENT=$(curl -s "https://sydneyscheduler.com/$JS_FILE")
    if echo "$JS_CONTENT" | grep -q "Google Analytics"; then
        echo "✅ Google Analytics code found in JS bundle"
    else
        echo "❌ Google Analytics code NOT found in JS bundle"
    fi
    
    if echo "$JS_CONTENT" | grep -q "G-DMDYBF56W7"; then
        echo "✅ Measurement ID found in JS bundle"
    else
        echo "❌ Measurement ID NOT found in JS bundle"
    fi
    rm -f /tmp/js_file.txt
fi

echo ""

# Summary and recommendations
echo "6. Summary & Recommendations:"
echo "============================"

# Count issues
ISSUES=0

if [ ! -f "/srv/sydneyscheduler/frontend/.env" ]; then
    echo "❌ Missing production .env file"
    ISSUES=$((ISSUES + 1))
fi

if ! grep -r "G-DMDYBF56W7" /srv/sydneyscheduler/frontend/build/ > /dev/null 2>&1; then
    echo "❌ GA ID not in built files - REBUILD REQUIRED"
    ISSUES=$((ISSUES + 1))
fi

if ! echo "$SITE_HTML" | grep -q "G-DMDYBF56W7"; then
    echo "❌ GA ID not in live site HTML - REBUILD REQUIRED"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ All checks passed! Your GA setup should be working."
    echo ""
    echo "If you still don't see data:"
    echo "1. Wait 2-5 minutes for data to appear"
    echo "2. Check GA Real-Time dashboard: https://analytics.google.com/analytics/web/#/p417946779/realtime/overview"
    echo "3. Disable ad blockers"
    echo "4. Test in incognito mode"
    echo "5. Run the browser debug script at your site"
else
    echo ""
    echo "🔧 FIXES NEEDED:"
    echo "==============="
    echo ""
    echo "1. Ensure .env file exists with correct GA ID:"
    echo "   echo 'REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7' > /srv/sydneyscheduler/frontend/.env"
    echo ""
    echo "2. Rebuild frontend with environment variables:"
    echo "   cd /srv/sydneyscheduler/frontend"
    echo "   npm run build"
    echo ""
    echo "3. Restart nginx:"
    echo "   sudo systemctl restart nginx"
    echo ""
    echo "4. Test again:"
    echo "   ./verify_production_analytics.sh"
fi

echo ""
echo "📊 Browser testing:"
echo "   Visit: https://sydneyscheduler.com/"
echo "   Console: Should see 'Google Analytics initialized with ID: G-DMDYBF56W7'"
echo "   Debug: Copy/paste debug-live-analytics.js into console"
