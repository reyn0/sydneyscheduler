#!/bin/bash
# Manual Scraping Test Script
# Use this to test your scraping functionality immediately

echo "🚀 Manual Scraping Test"
echo "======================"

# Check if backend is running
echo "1. Checking backend status..."
if ! curl -s http://127.0.0.1:8000/results > /dev/null; then
    echo "❌ Backend is not responding. Starting it..."
    sudo systemctl start webscraper.service
    sleep 5
    
    if ! curl -s http://127.0.0.1:8000/results > /dev/null; then
        echo "❌ Backend still not responding. Check logs:"
        sudo journalctl -u webscraper.service --no-pager -n 20
        exit 1
    fi
fi

echo "✅ Backend is responding"
echo ""

# Show current results
echo "2. Current results summary..."
CURRENT_RESULTS=$(curl -s http://127.0.0.1:8000/results)
CURRENT_COUNT=$(echo "$CURRENT_RESULTS" | jq '. | length' 2>/dev/null || echo "0")
echo "   Current roster entries: $CURRENT_COUNT"

if [ -f /srv/sydneyscheduler/backend/latest_results.json ]; then
    echo "   Last updated: $(stat -c %y /srv/sydneyscheduler/backend/latest_results.json)"
fi

echo ""

# Perform manual scrape
echo "3. Performing manual scrape..."
echo "   This may take 30-60 seconds..."

START_TIME=$(date +%s)
SCRAPE_RESULT=$(curl -s -w "HTTP_CODE:%{http_code}" http://127.0.0.1:8000/scrape)
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

HTTP_CODE=$(echo "$SCRAPE_RESULT" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
RESPONSE=$(echo "$SCRAPE_RESULT" | sed 's/HTTP_CODE:[0-9]*$//')

echo ""
echo "4. Scrape results:"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Scrape completed successfully (${DURATION}s)"
    
    # Parse and display results
    NEW_COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "Error parsing")
    echo "   New roster entries: $NEW_COUNT"
    
    if [ "$NEW_COUNT" != "Error parsing" ] && [ "$NEW_COUNT" -gt 0 ]; then
        echo ""
        echo "   Sites scraped:"
        echo "$RESPONSE" | jq -r '.[].site' 2>/dev/null | sort | uniq -c | sed 's/^/     /'
        
        echo ""
        echo "   Sample entries:"
        echo "$RESPONSE" | jq -r '.[0:3] | .[] | "     \(.name) - \(.site) (\(.shift_date))"' 2>/dev/null
    fi
else
    echo "❌ Scrape failed (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE"
fi

echo ""

# Check updated results
echo "5. Verification..."
UPDATED_RESULTS=$(curl -s http://127.0.0.1:8000/results)
UPDATED_COUNT=$(echo "$UPDATED_RESULTS" | jq '. | length' 2>/dev/null || echo "0")
echo "   Updated roster entries: $UPDATED_COUNT"

if [ "$UPDATED_COUNT" -gt "$CURRENT_COUNT" ]; then
    echo "✅ Results successfully updated (+$((UPDATED_COUNT - CURRENT_COUNT)) entries)"
elif [ "$UPDATED_COUNT" -eq "$CURRENT_COUNT" ] && [ "$CURRENT_COUNT" -gt 0 ]; then
    echo "ℹ️  Results unchanged (may be up to date already)"
else
    echo "⚠️  Unexpected result count change"
fi

echo ""

# Test the exact cron command
echo "6. Testing exact cron command..."
echo "   Command: curl -s http://127.0.0.1:8000/scrape > /dev/null"

curl -s http://127.0.0.1:8000/scrape > /dev/null
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Cron command format works (exit code: $EXIT_CODE)"
else
    echo "❌ Cron command failed (exit code: $EXIT_CODE)"
fi

echo ""

# Summary
echo "7. Summary & Next Steps:"
echo "======================="

if [ "$HTTP_CODE" = "200" ] && [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Manual scraping works perfectly!"
    echo ""
    echo "Your cron job should work. If it's not running:"
    echo "   1. Check cron service: sudo systemctl status cron"
    echo "   2. Check cron logs: sudo tail -f /var/log/syslog | grep CRON"
    echo "   3. Run monitoring: ./monitor_cron.sh"
    echo ""
    echo "Current cron schedule:"
    echo "   0 8,14,18,19 * * * (8am, 2pm, 6pm, 7pm daily)"
    echo ""
    echo "To test cron immediately, add a temporary entry:"
    echo "   crontab -e"
    echo "   Add: */2 * * * * curl -s http://127.0.0.1:8000/scrape > /tmp/test_scrape.log 2>&1"
    echo "   (Remove after testing)"
else
    echo "❌ Issues found with scraping. Check backend logs:"
    echo "   sudo journalctl -u webscraper.service --no-pager -n 20"
fi

echo ""
echo "📊 Quick monitoring commands:"
echo "   ./monitor_cron.sh     # Full status check"
echo "   ./debug_cron.sh       # Detailed debugging"
echo "   sudo tail -f /var/log/syslog | grep CRON  # Live cron logs"
