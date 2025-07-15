# 🕐 Cron Job Troubleshooting Guide

Your cron expression `0 8,14,18,19 * * *` is **correct** and should run at:
- **8:00 AM** (08:00)
- **2:00 PM** (14:00) 
- **6:00 PM** (18:00)
- **7:00 PM** (19:00)

## 🔍 Common Issues & Solutions

### Issue 1: Cron Service Not Running
```bash
# Check if cron is running
sudo systemctl status cron

# Start cron if stopped
sudo systemctl start cron
sudo systemctl enable cron
```

### Issue 2: Backend Not Responding
```bash
# Check backend service
sudo systemctl status webscraper.service

# Restart backend
sudo systemctl restart webscraper.service

# Check backend logs
sudo journalctl -u webscraper.service -n 20
```

### Issue 3: Wrong URL or Port
Your current command: `curl -s http://127.0.0.1:8000/scrape > /dev/null`

**Test manually:**
```bash
# Test if backend responds
curl -s http://127.0.0.1:8000/results

# Test scrape endpoint
curl -s http://127.0.0.1:8000/scrape

# Check what port backend is actually running on
sudo netstat -tlnp | grep :8000
```

### Issue 4: PATH Issues in Cron
Cron has limited PATH. Use full path to curl:
```bash
# Find curl location
which curl

# Update cron to use full path
0 8,14,18,19 * * * /usr/bin/curl -s http://127.0.0.1:8000/scrape > /dev/null 2>&1
```

### Issue 5: No Logging
Add logging to see what's happening:
```bash
# Better cron entry with logging
0 8,14,18,19 * * * /usr/bin/curl -s -m 60 http://127.0.0.1:8000/scrape >> /var/log/webscraper/cron.log 2>&1
```

## 🛠️ Step-by-Step Diagnosis

### Step 1: Use the Debugging Scripts
```bash
# Run comprehensive diagnosis
./debug_cron.sh

# Monitor current status
./monitor_cron.sh

# Test scraping manually
./test_scraping.sh
```

### Step 2: Check Cron Logs
```bash
# View recent cron activity
sudo tail -20 /var/log/syslog | grep CRON

# Monitor cron in real-time
sudo tail -f /var/log/syslog | grep CRON
```

### Step 3: Test Immediate Cron
Add a test cron that runs every 2 minutes:
```bash
crontab -e

# Add this line for testing
*/2 * * * * /usr/bin/curl -s http://127.0.0.1:8000/scrape >> /tmp/test_cron.log 2>&1

# Wait 2-4 minutes, then check
cat /tmp/test_cron.log

# Remove test line after confirming it works
```

### Step 4: Fix and Setup Proper Cron
```bash
# Run the setup script
./setup_cron.sh

# This will:
# - Test backend connectivity
# - Create proper cron entries with logging
# - Add a temporary test cron
# - Set up monitoring
```

## 📊 Monitoring Commands

### Real-time Monitoring
```bash
# Watch cron executions live
sudo tail -f /var/log/syslog | grep CRON

# Watch scraper logs
tail -f /var/log/webscraper/cron.log

# Monitor backend service
sudo journalctl -u webscraper.service -f
```

### Check Results
```bash
# Check if results file is being updated
ls -la /srv/sydneyscheduler/backend/latest_results.json
stat -c %y /srv/sydneyscheduler/backend/latest_results.json

# Test API endpoints
curl -s http://127.0.0.1:8000/results | jq '. | length'
```

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
sudo systemctl restart cron
sudo systemctl restart webscraper.service
```

### Fix 2: Improved Cron Entry
Replace your current cron with this better version:
```bash
# Remove old entry
crontab -l | grep -v "127.0.0.1:8000/scrape" | crontab -

# Add improved entry
(crontab -l; echo "0 8,14,18,19 * * * /usr/bin/curl -s -m 60 --retry 3 http://127.0.0.1:8000/scrape >> /var/log/webscraper/cron.log 2>&1") | crontab -
```

### Fix 3: Create Log Directory
```bash
sudo mkdir -p /var/log/webscraper
sudo chown $(whoami):$(whoami) /var/log/webscraper
```

## 🎯 Verification Checklist

- [ ] Cron service is running: `sudo systemctl status cron`
- [ ] Backend service is running: `sudo systemctl status webscraper.service`
- [ ] Backend responds: `curl -s http://127.0.0.1:8000/results`
- [ ] Scrape endpoint works: `curl -s http://127.0.0.1:8000/scrape`
- [ ] Cron job is listed: `crontab -l`
- [ ] Log directory exists: `ls -la /var/log/webscraper/`
- [ ] Recent cron activity: `sudo tail -5 /var/log/syslog | grep CRON`

## 📅 Schedule Verification

Your cron `0 8,14,18,19 * * *` means:
- **Minute**: 0 (exactly on the hour)
- **Hour**: 8,14,18,19 (8am, 2pm, 6pm, 7pm)
- **Day**: * (every day)
- **Month**: * (every month)  
- **Weekday**: * (every day of week)

This is **perfect** for keeping rosters updated throughout the day!

## 🚨 Emergency Manual Run

If cron is not working, you can manually update rosters:
```bash
# Manual scrape
curl -s http://127.0.0.1:8000/scrape

# Or run the full test
./test_scraping.sh
```

## 📞 Get Help

If issues persist after trying these solutions:
1. Run `./debug_cron.sh` and save the output
2. Check `sudo journalctl -u webscraper.service -n 50`
3. Look at `/var/log/syslog` for cron errors
4. Verify your DigitalOcean firewall isn't blocking localhost connections
