#!/bin/bash
# Make deployment scripts executable
# Run this on your DigitalOcean server

echo "🔧 Setting up deployment scripts..."

cd /srv/sydneyscheduler/deployment-scripts || {
    echo "❌ Deployment scripts directory not found"
    echo "Make sure you're in the right location or copy scripts first"
    exit 1
}

# Make all shell scripts executable
chmod +x *.sh

echo "✅ Scripts made executable:"
ls -la *.sh

echo ""
echo "📋 Available scripts:"
echo "==================="
echo "   ./setup_cron.sh      - Fix and setup cron job with logging"
echo "   ./debug_cron.sh      - Comprehensive cron debugging"  
echo "   ./monitor_cron.sh    - Monitor cron job status"
echo "   ./test_scraping.sh   - Manual scraping test"
echo ""
echo "🚀 Quick start: run ./setup_cron.sh to fix your cron job!"
