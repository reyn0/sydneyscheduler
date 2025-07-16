# 🛠️ Production Troubleshooting Guide

Complete troubleshooting guide for the Sydney Scheduler web scraper application deployed on DigitalOcean VPS.

## 🚀 Production System Overview

**Live Site**: https://sydneyscheduler.com/

### System Components
- **Backend**: FastAPI service on port 8000 (webscraper.service)
- **Frontend**: React app served by Nginx on ports 80/443
- **SSL**: Let's Encrypt certificates for HTTPS
- **Automation**: Cron jobs for scraping (8am, 2pm, 6pm, 7pm daily)
- **Analytics**: Google Analytics 4 with measurement ID G-DMDYBF56W7

### File Structure on Server
```
/srv/sydneyscheduler/
├── frontend/
│   ├── build/               # React production build (served by Nginx)
│   ├── src/                 # Source code
│   └── .env                 # Environment variables (GA ID)
├── backend/
│   ├── app/                 # FastAPI application
│   └── latest_results.json  # Scraped data storage
└── deployment-scripts/      # Automated tools

/etc/nginx/sites-enabled/webscraper    # Nginx configuration
/etc/systemd/system/webscraper.service # Backend service
/etc/letsencrypt/live/sydneyscheduler.com/ # SSL certificates
```

## 🔧 Quick Diagnostic Tools

### Essential Scripts (All Working ✅)

```bash
# Make scripts executable
chmod +x deployment-scripts/*.sh

# Complete system verification
./deployment-scripts/verify_production_analytics.sh

# Cron job monitoring and setup
./deployment-scripts/monitor_cron.sh
./deployment-scripts/setup_cron.sh

# Manual scraping test
./deployment-scripts/test_scraping.sh

# SSL and network diagnostics
./deployment-scripts/ssl_troubleshoot.sh
./deployment-scripts/dns_firewall_check.sh
```

### 2. `nginx_fix.sh`
**Purpose**: Fix common Nginx configuration and permission issues
**Use when**: Nginx is not serving files or has configuration errors

```bash
chmod +x nginx_fix.sh
./nginx_fix.sh
```

**Fixes**:
- Corrects frontend build path
- Sets proper file permissions (www-data ownership)
- Updates Nginx configuration with correct paths
- Ensures backend service is running
- Restarts Nginx service

### 3. `webscraper_fix.sh`
**Purpose**: Fix backend service issues
**Use when**: API endpoints are not responding

```bash
chmod +x webscraper_fix.sh
./webscraper_fix.sh
```

**Fixes**:
- Recreates systemd service file
- Ensures correct Python environment
- Restarts webscraper service
- Validates API endpoints

### 4. `ssl_setup.sh`
**Purpose**: Initial SSL certificate setup
**Use when**: Setting up HTTPS for the first time

```bash
chmod +x ssl_setup.sh
./ssl_setup.sh
```

**Actions**:
- Installs Certbot
- Obtains Let's Encrypt certificate
- Configures Nginx for HTTPS
- Sets up automatic renewal

### 5. `ssl_troubleshoot.sh`
**Purpose**: Diagnose SSL certificate issues
**Use when**: HTTPS is not working or certificates are expired

```bash
chmod +x ssl_troubleshoot.sh
./ssl_troubleshoot.sh
```

**Checks**:
- Certificate existence and validity
- Certificate expiration date
- Domain validation
- SSL configuration in Nginx

### 6. `dns_firewall_check.sh`
**Purpose**: Check DNS resolution and firewall configuration
**Use when**: Site is not accessible from external networks

```bash
chmod +x dns_firewall_check.sh
./dns_firewall_check.sh
```

**Checks**:
- DNS resolution to correct IP
- UFW/iptables firewall rules
- Port connectivity
- DigitalOcean firewall settings

## 🚨 Common Issues & Solutions

### 1. Google Analytics Not Working

**Symptoms**: Console shows GA initialized but no data in dashboard

**Diagnosis**:
```bash
./deployment-scripts/verify_production_analytics.sh
```

**Solutions**:
```bash
# If GA ID missing from build files
cd /srv/sydneyscheduler/frontend
echo 'REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7' > .env
REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7 npm run build

# Deploy to nginx
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx
```

**Verification**:
- Visit https://sydneyscheduler.com/
- Console should show: `Google Analytics initialized with ID: G-DMDYBF56W7`
- Check GA Real-Time dashboard: https://analytics.google.com/analytics/web/#/p417946779/realtime/overview

### 2. Cron Jobs Not Running

**Symptoms**: Roster data not updating automatically

**Diagnosis**:
```bash
./deployment-scripts/monitor_cron.sh
./deployment-scripts/debug_cron.sh
```

**Solutions**:
```bash
# Setup/fix cron jobs
./deployment-scripts/setup_cron.sh

# Manual test
./deployment-scripts/test_scraping.sh

# Check cron logs
sudo tail -f /var/log/syslog | grep CRON
tail -f /var/log/webscraper/cron.log
```

**Current Schedule**: Runs at 8:00 AM, 2:00 PM, 6:00 PM, 7:00 PM daily

### 3. Backend Service Issues

**Symptoms**: API not responding, 502 errors

**Diagnosis**:
```bash
sudo systemctl status webscraper.service
sudo journalctl -u webscraper.service -n 20
curl http://localhost:8000/results
```

**Solutions**:
```bash
# Restart backend service
sudo systemctl restart webscraper.service

# Fix service if broken
./deployment-scripts/webscraper_fix.sh

# Check dependencies
cd /srv/sydneyscheduler/backend
pip install -r requirements.txt
```

### 4. SSL Certificate Issues

**Symptoms**: HTTPS not working, certificate warnings

**Diagnosis**:
```bash
./deployment-scripts/ssl_troubleshoot.sh
```

**Solutions**:
```bash
# Renew SSL certificates
sudo certbot renew

# Fix SSL configuration
./deployment-scripts/ssl_setup.sh

# Check certificate status
sudo certbot certificates
```

### 5. Nginx Configuration Issues

**Symptoms**: Site not loading, 404 errors, wrong content

**Diagnosis**:
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Solutions**:
```bash
# Fix nginx configuration
./deployment-scripts/nginx_fix.sh

# Restart nginx
sudo systemctl restart nginx

# Check configuration
cat /etc/nginx/sites-enabled/webscraper
```

### 6. Port 443 (HTTPS) Issues

**Symptoms**: Site only works on HTTP, not HTTPS

**Solutions**:
```bash
./deployment-scripts/fix_port_443.sh

# Check firewall
sudo ufw status
sudo ufw allow 443

# Check port binding
sudo netstat -tlnp | grep :443
```

## 📋 Manual Verification Steps

### 1. Check Service Status
```bash
sudo systemctl status nginx
sudo systemctl status webscraper
```

### 2. Check Port Listening
```bash
netstat -tlnp | grep -E ":80|:443|:8000"
```

### 3. Test Local Connectivity
```bash
curl -I http://localhost/
curl -k -I https://localhost/
curl -I http://localhost:8000/results
```

### 4. Check Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u webscraper -f
```

### 5. Test Nginx Configuration
```bash
sudo nginx -t
```

## 🌐 Expected URLs and Responses

- `https://yourdomain.com/` - React frontend (200 OK)
- `https://yourdomain.com/results` - JSON roster data (200 OK)
- `https://yourdomain.com/scrape` - Trigger scraping (200 OK)
- `http://yourdomain.com/` - Redirect to HTTPS (301 Moved)

## 📞 Emergency Recovery

If everything breaks, run these commands in order:

1. **Restore Basic Nginx**:
```bash
sudo systemctl stop nginx
sudo nginx -t
./nginx_fix.sh
```

2. **Restart Backend**:
```bash
./webscraper_fix.sh
```

3. **Verify Everything**:
```bash
./final_verification.sh
```

4. **Check External Access**:
```bash
./dns_firewall_check.sh
```

## 🔄 Maintenance Tasks

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Restart services if needed
sudo systemctl restart nginx webscraper
```

### SSL Certificate Renewal
Certificates auto-renew, but to manually renew:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Check Scraping Data
```bash
# View latest scraped data
cat /srv/sydneyscheduler/backend/latest_results.json | jq .

# Manually trigger scraping
curl https://yourdomain.com/scrape
```

## 📊 System Health Checks

### Daily Monitoring
```bash
# Quick system status
./deployment-scripts/monitor_cron.sh

# Verify analytics working
./deployment-scripts/verify_production_analytics.sh

# Test scraping manually
./deployment-scripts/test_scraping.sh
```

### Service Status Commands
```bash
# Check all services
sudo systemctl status nginx webscraper.service cron

# Check logs
sudo journalctl -u webscraper.service -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/webscraper/cron.log
```

### Performance Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check process status
ps aux | grep -E "(nginx|uvicorn|python)"

# Check latest scraping results
ls -la /srv/sydneyscheduler/backend/latest_results.json
```

## 🔍 Diagnostic Information

### System Information
- **OS**: Ubuntu 20.04+ LTS
- **Web Server**: Nginx with reverse proxy
- **Backend**: Python 3.8+ with FastAPI and Selenium
- **Frontend**: React 18+ with Bootstrap 5
- **SSL**: Let's Encrypt certificates
- **Automation**: Systemd + Cron

### Port Configuration
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (main site)
- **8000**: Backend API (localhost only)
- **22**: SSH access

### Log Locations
```bash
# Application logs
/var/log/webscraper/cron.log           # Cron job execution
sudo journalctl -u webscraper.service  # Backend service logs

# System logs
/var/log/nginx/access.log              # Nginx access logs
/var/log/nginx/error.log               # Nginx error logs
/var/log/syslog                        # System logs (includes cron)
```

## 🎯 Success Indicators

### Working System Shows:
- ✅ https://sydneyscheduler.com/ loads correctly
- ✅ Console shows: `Google Analytics initialized with ID: G-DMDYBF56W7`
- ✅ GA Real-Time dashboard shows active users
- ✅ Roster data updates automatically every 4-6 hours
- ✅ Manual scraping works via "Update Now" button
- ✅ SSL certificate valid and auto-renewing
- ✅ All services running: `nginx`, `webscraper.service`, `cron`

### Performance Benchmarks:
- **Page load**: < 2 seconds
- **API response**: < 500ms
- **Scraping duration**: 30-60 seconds
- **Data freshness**: Max 6 hours old

## 📞 Emergency Recovery

### Complete System Restart
```bash
# Restart all services
sudo systemctl restart nginx webscraper.service cron

# Rebuild frontend if needed
cd /srv/sydneyscheduler/frontend
npm run build
sudo cp -r build/* /var/www/html/

# Force SSL renewal if needed
sudo certbot renew --force-renewal
```

### Backup and Recovery
```bash
# Backup scraped data
cp /srv/sydneyscheduler/backend/latest_results.json ~/backup/

# Backup nginx config
cp /etc/nginx/sites-enabled/webscraper ~/backup/

# Backup environment variables
cp /srv/sydneyscheduler/frontend/.env ~/backup/
```

---

**Last Updated**: January 2025 | **System Status**: ✅ Production Ready
