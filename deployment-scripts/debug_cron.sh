#!/bin/bash
# Cron Job Debugging Script
# Run this on your DigitalOcean server to diagnose cron issues

echo "🔍 Diagnosing Cron Job Issues"
echo "============================="

# Check cron service status
echo "1. Checking cron service status..."
sudo systemctl status cron
echo ""

# Check if crontab exists
echo "2. Current crontab entries..."
crontab -l
echo ""

# Check cron logs
echo "3. Recent cron logs..."
sudo tail -20 /var/log/syslog | grep CRON
echo ""

# Test backend connectivity
echo "4. Testing backend connectivity..."
echo "   Testing localhost:8000..."
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:8000/results
echo ""

echo "   Testing 127.0.0.1:8000..."
curl -s -w "HTTP Status: %{http_code}\n" http://127.0.0.1:8000/results
echo ""

# Check if backend service is running
echo "5. Backend service status..."
sudo systemctl status webscraper.service
echo ""

# Test the scrape endpoint specifically
echo "6. Testing scrape endpoint..."
echo "   Manual scrape test:"
curl -s -w "HTTP Status: %{http_code}\n" http://127.0.0.1:8000/scrape
echo ""

# Check file permissions and ownership
echo "7. Checking file permissions..."
ls -la /srv/sydneyscheduler/backend/latest_results.json 2>/dev/null || echo "   Results file not found"
echo ""

# Check if cron can write logs
echo "8. Testing cron log writing..."
echo "Creating test cron entry..."
(crontab -l 2>/dev/null; echo "* * * * * echo 'Test cron entry at $(date)' >> /tmp/cron_test.log") | crontab -

echo "   Waiting 2 minutes for test cron to run..."
echo "   You can check /tmp/cron_test.log after this completes"
echo ""

# Show environment variables that cron uses
echo "9. Cron environment check..."
echo "Current user: $(whoami)"
echo "PATH in cron might be limited. Current PATH:"
echo "$PATH"
echo ""

# Provide recommendations
echo "🛠️  RECOMMENDATIONS:"
echo "==================="
echo ""
echo "If backend is not responding:"
echo "   sudo systemctl restart webscraper.service"
echo ""
echo "If cron is not running:"
echo "   sudo systemctl restart cron"
echo ""
echo "To see live cron logs:"
echo "   sudo tail -f /var/log/syslog | grep CRON"
echo ""
echo "To test your exact cron command:"
echo "   curl -s http://127.0.0.1:8000/scrape > /dev/null; echo 'Exit code: $?'"
echo ""
echo "Current cron schedule: 0 8,14,18,19 * * *"
echo "   Runs at: 8:00 AM, 2:00 PM, 6:00 PM, 7:00 PM daily"
echo ""
