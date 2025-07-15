#!/bin/bash
# Monitor Cron Job Performance
# Run this to check if your cron jobs are working

echo "📊 Cron Job Monitoring Dashboard"
echo "================================"

# Function to check if a service is running
check_service() {
    if sudo systemctl is-active --quiet $1; then
        echo "✅ $1 is running"
    else
        echo "❌ $1 is not running"
        return 1
    fi
}

# Check essential services
echo "1. Service Status Check:"
check_service cron
check_service webscraper.service
echo ""

# Show current crontab
echo "2. Active Cron Jobs:"
echo "==================="
crontab -l 2>/dev/null || echo "No cron jobs found"
echo ""

# Check recent cron executions
echo "3. Recent Cron Executions:"
echo "=========================="
sudo tail -10 /var/log/syslog | grep CRON | tail -5
echo ""

# Check scraper logs
echo "4. Scraper Cron Logs:"
echo "===================="
if [ -f /var/log/webscraper/cron.log ]; then
    echo "Main cron log (last 10 lines):"
    tail -10 /var/log/webscraper/cron.log
    echo ""
    echo "Log file size: $(du -h /var/log/webscraper/cron.log | cut -f1)"
else
    echo "❌ Main cron log not found: /var/log/webscraper/cron.log"
fi

echo ""
if [ -f /var/log/webscraper/test_cron.log ]; then
    echo "Test cron log (last 5 lines):"
    tail -5 /var/log/webscraper/test_cron.log
    echo ""
    echo "Test log entries: $(wc -l < /var/log/webscraper/test_cron.log)"
else
    echo "ℹ️  Test cron log not found (normal if test cron was removed)"
fi

echo ""

# Check latest results
echo "5. Latest Scraping Results:"
echo "=========================="
if [ -f /srv/sydneyscheduler/backend/latest_results.json ]; then
    echo "Results file found:"
    ls -la /srv/sydneyscheduler/backend/latest_results.json
    echo ""
    echo "Last modified: $(stat -c %y /srv/sydneyscheduler/backend/latest_results.json)"
    echo ""
    echo "File size: $(du -h /srv/sydneyscheduler/backend/latest_results.json | cut -f1)"
    echo ""
    
    # Check if file was updated recently
    LAST_MODIFIED=$(stat -c %Y /srv/sydneyscheduler/backend/latest_results.json)
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_MODIFIED))
    HOURS_OLD=$((TIME_DIFF / 3600))
    
    if [ $HOURS_OLD -lt 12 ]; then
        echo "✅ Results file is recent (${HOURS_OLD} hours old)"
    else
        echo "⚠️  Results file is old (${HOURS_OLD} hours old)"
    fi
else
    echo "❌ Results file not found"
fi

echo ""

# Test backend connectivity
echo "6. Backend Connectivity Test:"
echo "============================="
echo "Testing /results endpoint..."
RESULTS_STATUS=$(curl -s -w "%{http_code}" http://127.0.0.1:8000/results -o /tmp/backend_test.json)
if [ "$RESULTS_STATUS" = "200" ]; then
    echo "✅ /results endpoint working"
    RESULT_COUNT=$(jq '. | length' /tmp/backend_test.json 2>/dev/null || echo "N/A")
    echo "   Records returned: $RESULT_COUNT"
else
    echo "❌ /results endpoint failed (HTTP $RESULTS_STATUS)"
fi

echo ""
echo "Testing /scrape endpoint..."
SCRAPE_STATUS=$(curl -s -w "%{http_code}" http://127.0.0.1:8000/scrape -o /tmp/scrape_test.json)
if [ "$SCRAPE_STATUS" = "200" ]; then
    echo "✅ /scrape endpoint working"
else
    echo "❌ /scrape endpoint failed (HTTP $SCRAPE_STATUS)"
fi

# Clean up temp files
rm -f /tmp/backend_test.json /tmp/scrape_test.json

echo ""

# Next scheduled run
echo "7. Next Scheduled Runs:"
echo "======================="
echo "Cron schedule: 0 8,14,18,19 * * *"
echo "Next runs today:"

CURRENT_HOUR=$(date +%H)
for hour in 8 14 18 19; do
    if [ $hour -gt $CURRENT_HOUR ]; then
        printf "   %02d:00 (in %d hours)\n" $hour $((hour - CURRENT_HOUR))
        break
    fi
done

echo ""

# Summary and recommendations
echo "8. Summary & Recommendations:"
echo "============================"

ISSUES=0

# Check if cron is working
if ! sudo systemctl is-active --quiet cron; then
    echo "❌ Cron service is not running - restart with: sudo systemctl start cron"
    ISSUES=$((ISSUES + 1))
fi

# Check if backend is working
if ! sudo systemctl is-active --quiet webscraper.service; then
    echo "❌ Backend service is not running - restart with: sudo systemctl start webscraper.service"
    ISSUES=$((ISSUES + 1))
fi

# Check if logs exist
if [ ! -f /var/log/webscraper/cron.log ]; then
    echo "⚠️  No cron logs found - may need to wait for next scheduled run"
    ISSUES=$((ISSUES + 1))
fi

# Check recent activity
if [ -f /srv/sydneyscheduler/backend/latest_results.json ]; then
    LAST_MODIFIED=$(stat -c %Y /srv/sydneyscheduler/backend/latest_results.json)
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_MODIFIED))
    HOURS_OLD=$((TIME_DIFF / 3600))
    
    if [ $HOURS_OLD -gt 24 ]; then
        echo "⚠️  Results are more than 24 hours old - cron may not be working"
        ISSUES=$((ISSUES + 1))
    fi
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ Everything looks good! Cron job should be working properly."
    echo ""
    echo "To monitor in real-time:"
    echo "   sudo tail -f /var/log/syslog | grep CRON"
    echo "   tail -f /var/log/webscraper/cron.log"
else
    echo ""
    echo "🔧 Issues found. Run ./debug_cron.sh for detailed troubleshooting."
fi

echo ""
echo "📁 Log file locations:"
echo "   Main cron: /var/log/webscraper/cron.log"
echo "   System: /var/log/syslog"
echo "   Backend: sudo journalctl -u webscraper.service"
