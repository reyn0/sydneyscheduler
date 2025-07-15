#!/bin/bash
# Fix and Setup Cron Job for Web Scraper
# Run this on your DigitalOcean server

echo "🔧 Setting up Cron Job for Web Scraper"
echo "====================================="

# Ensure backend is running
echo "1. Checking backend service..."
sudo systemctl status webscraper.service --no-pager

if ! sudo systemctl is-active --quiet webscraper.service; then
    echo "   ❌ Backend not running, starting it..."
    sudo systemctl start webscraper.service
    sleep 3
fi

# Test backend connectivity
echo ""
echo "2. Testing backend connectivity..."
BACKEND_TEST=$(curl -s -w "%{http_code}" http://127.0.0.1:8000/results -o /dev/null)

if [ "$BACKEND_TEST" = "200" ]; then
    echo "   ✅ Backend responding (HTTP 200)"
else
    echo "   ❌ Backend not responding (HTTP $BACKEND_TEST)"
    echo "   Checking backend logs..."
    sudo journalctl -u webscraper.service --no-pager -n 10
    exit 1
fi

# Test the scrape endpoint
echo ""
echo "3. Testing scrape endpoint..."
SCRAPE_TEST=$(curl -s -w "%{http_code}" http://127.0.0.1:8000/scrape -o /dev/null)

if [ "$SCRAPE_TEST" = "200" ]; then
    echo "   ✅ Scrape endpoint working (HTTP 200)"
else
    echo "   ⚠️  Scrape endpoint returned HTTP $SCRAPE_TEST"
fi

# Create improved cron job with logging
echo ""
echo "4. Setting up cron job with logging..."

# Remove any existing similar cron jobs
echo "   Removing old cron entries..."
crontab -l 2>/dev/null | grep -v "127.0.0.1:8000/scrape" | crontab -

# Create log directory
sudo mkdir -p /var/log/webscraper
sudo chown $(whoami):$(whoami) /var/log/webscraper

# Add new cron job with better error handling and logging
echo "   Adding new cron job..."
(crontab -l 2>/dev/null; echo "# Web scraper - runs at 8am, 2pm, 6pm, 7pm daily") | crontab -
(crontab -l 2>/dev/null; echo "0 8,14,18,19 * * * /usr/bin/curl -s -m 60 --retry 3 http://127.0.0.1:8000/scrape >> /var/log/webscraper/cron.log 2>&1") | crontab -

# Also add a test entry that runs every 5 minutes (for immediate testing)
echo "   Adding test cron job (runs every 5 minutes)..."
(crontab -l 2>/dev/null; echo "# Test scraper - remove this after confirming it works") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/bin/curl -s -m 30 http://127.0.0.1:8000/scrape >> /var/log/webscraper/test_cron.log 2>&1") | crontab -

# Show current crontab
echo ""
echo "5. Current crontab:"
crontab -l

# Ensure cron service is running
echo ""
echo "6. Ensuring cron service is active..."
sudo systemctl enable cron
sudo systemctl start cron
sudo systemctl status cron --no-pager

# Create a manual test script
echo ""
echo "7. Creating manual test script..."
cat > /tmp/test_scrape.sh << 'EOF'
#!/bin/bash
echo "Manual scrape test at $(date)"
echo "================================"

# Test the exact command from cron
echo "Running: curl -s -m 60 --retry 3 http://127.0.0.1:8000/scrape"
RESULT=$(curl -s -m 60 --retry 3 -w "HTTP_CODE:%{http_code}" http://127.0.0.1:8000/scrape)
HTTP_CODE=$(echo "$RESULT" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
RESPONSE=$(echo "$RESULT" | sed 's/HTTP_CODE:[0-9]*$//')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"
echo "Exit code: $?"
echo ""
EOF

chmod +x /tmp/test_scrape.sh

echo ""
echo "✅ Cron setup complete!"
echo ""
echo "📋 VERIFICATION STEPS:"
echo "====================="
echo ""
echo "1. Run manual test:"
echo "   /tmp/test_scrape.sh"
echo ""
echo "2. Check test cron log (wait 5 minutes):"
echo "   tail -f /var/log/webscraper/test_cron.log"
echo ""
echo "3. Check main cron log (after scheduled times):"
echo "   tail -f /var/log/webscraper/cron.log"
echo ""
echo "4. Monitor live cron execution:"
echo "   sudo tail -f /var/log/syslog | grep CRON"
echo ""
echo "5. Remove test cron job after verification:"
echo "   crontab -e  # Delete the */5 line"
echo ""
echo "📅 SCHEDULE:"
echo "============"
echo "Main scraping: 8:00 AM, 2:00 PM, 6:00 PM, 7:00 PM daily"
echo "Test scraping: Every 5 minutes (remove after testing)"
echo ""
echo "🔍 TROUBLESHOOTING:"
echo "=================="
echo "If issues persist, run: ./debug_cron.sh"
echo ""
