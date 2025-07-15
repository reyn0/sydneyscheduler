#!/bin/bash
# Quick Google Analytics Diagnostic
# Run this first to see what's wrong

echo "🔍 Quick GA Diagnostic"
echo "====================="

echo "1. Frontend .env file check:"
if [ -f "/srv/sydneyscheduler/frontend/.env" ]; then
    echo "✅ .env exists:"
    cat /srv/sydneyscheduler/frontend/.env
else
    echo "❌ .env file missing at /srv/sydneyscheduler/frontend/.env"
fi

echo ""
echo "2. Build directory check:"
if [ -d "/srv/sydneyscheduler/frontend/build" ]; then
    echo "✅ Build directory exists"
    if grep -r "G-DMDYBF56W7" /srv/sydneyscheduler/frontend/build/ > /dev/null 2>&1; then
        echo "✅ GA ID found in build"
    else
        echo "❌ GA ID NOT found in build - REBUILD NEEDED"
    fi
else
    echo "❌ Build directory missing - BUILD NEEDED"
fi

echo ""
echo "3. Nginx config check:"
if [ -f "/etc/nginx/sites-enabled/webscraper" ]; then
    echo "✅ Nginx config found: webscraper"
    DOC_ROOT=$(grep "root" /etc/nginx/sites-enabled/webscraper | head -1 | awk '{print $2}' | sed 's/;//')
    echo "Document root: $DOC_ROOT"
elif [ -f "/etc/nginx/sites-enabled/sydneyscheduler" ]; then
    echo "✅ Nginx config found: sydneyscheduler"
    DOC_ROOT=$(grep "root" /etc/nginx/sites-enabled/sydneyscheduler | head -1 | awk '{print $2}' | sed 's/;//')
    echo "Document root: $DOC_ROOT"
else
    echo "❌ No nginx config found"
    echo "Available configs:"
    ls -la /etc/nginx/sites-enabled/
fi

echo ""
echo "4. Live site check:"
SITE_HTML=$(curl -s https://sydneyscheduler.com/ 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Site accessible"
    if echo "$SITE_HTML" | grep -q "G-DMDYBF56W7"; then
        echo "✅ GA ID found in live HTML"
    else
        echo "❌ GA ID NOT found in live HTML"
    fi
    
    if echo "$SITE_HTML" | grep -q "googletagmanager.com"; then
        echo "✅ GA script found in HTML"
    else
        echo "❌ GA script NOT found in HTML"
    fi
else
    echo "❌ Site not accessible"
fi

echo ""
echo "🎯 DIAGNOSIS:"
echo "============"

NEED_ENV=false
NEED_BUILD=false
NEED_DEPLOY=false

if [ ! -f "/srv/sydneyscheduler/frontend/.env" ]; then
    echo "❌ Missing .env file"
    NEED_ENV=true
fi

if ! grep -r "G-DMDYBF56W7" /srv/sydneyscheduler/frontend/build/ > /dev/null 2>&1; then
    echo "❌ GA ID not in build files"
    NEED_BUILD=true
fi

if ! echo "$SITE_HTML" | grep -q "G-DMDYBF56W7"; then
    echo "❌ GA ID not in live site"
    NEED_DEPLOY=true
fi

echo ""
echo "🔧 SOLUTION:"
echo "============"

if $NEED_ENV || $NEED_BUILD || $NEED_DEPLOY; then
    echo "Run the complete fix script:"
    echo "   ./fix_analytics_build.sh"
    echo ""
    echo "This will:"
    echo "   ✅ Create correct .env file"
    echo "   ✅ Rebuild frontend with GA"
    echo "   ✅ Deploy to nginx"
    echo "   ✅ Restart services"
else
    echo "✅ Everything looks good! GA should be working."
    echo "If you still don't see data:"
    echo "   1. Wait 2-5 minutes"
    echo "   2. Check GA Real-Time dashboard"
    echo "   3. Disable ad blockers"
    echo "   4. Test in incognito mode"
fi
