# Deployment Troubleshooting Guide

This guide provides step-by-step instructions for deploying and troubleshooting the Web Scraper application on a DigitalOcean VPS.

## 🚀 Deployment Overview

The application consists of:
- **Backend**: FastAPI service running on port 8000 (webscraper.service)
- **Frontend**: React app served by Nginx on ports 80/443
- **SSL**: Let's Encrypt certificates for HTTPS
- **Reverse Proxy**: Nginx proxies API requests to the backend

## 📁 File Structure on Server

```
/srv/sydneyscheduler/
├── frontend/build/          # React production build
│   ├── index.html
│   ├── static/
│   └── ...
├── backend/                 # FastAPI application
│   ├── app/
│   ├── latest_results.json
│   └── ...
└── ...

/etc/nginx/sites-available/webscraper    # Nginx configuration
/etc/nginx/sites-enabled/webscraper      # Symlink to enable site
/etc/systemd/system/webscraper.service   # Backend service definition
/etc/letsencrypt/live/[domain]/           # SSL certificates
```

## 🔧 Troubleshooting Scripts

### 1. `final_verification.sh`
**Purpose**: Comprehensive check of all deployment components
**Use when**: Want to verify entire deployment status

```bash
chmod +x final_verification.sh
./final_verification.sh
```

**Checks**:
- Nginx service status and port listening
- Backend service status and API response
- SSL certificate validity
- Frontend build files and permissions
- Nginx configuration validity
- Local and external connectivity

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

## 🛠️ Common Issues and Solutions

### Issue 1: "Connection Refused" on HTTPS
**Symptoms**: HTTPS returns connection refused error
**Cause**: Nginx not listening on port 443
**Solution**: 
```bash
./nginx_fix.sh
sudo nginx -t
sudo systemctl restart nginx
```

### Issue 2: "Permission Denied" for Frontend Files
**Symptoms**: Nginx logs show permission denied for index.html
**Cause**: Wrong file ownership or incorrect path
**Solution**:
```bash
sudo chown -R www-data:www-data /srv/sydneyscheduler/frontend/build/
sudo chmod -R 755 /srv/sydneyscheduler/frontend/build/
```

### Issue 3: API Endpoints Return 502 Bad Gateway
**Symptoms**: /results or /scrape endpoints return 502 error
**Cause**: Backend service not running or wrong port
**Solution**:
```bash
./webscraper_fix.sh
sudo systemctl status webscraper
sudo systemctl restart webscraper
```

### Issue 4: SSL Certificate Errors
**Symptoms**: HTTPS shows certificate warnings or errors
**Cause**: Certificate expired or not properly configured
**Solution**:
```bash
./ssl_troubleshoot.sh
sudo certbot renew --dry-run
./ssl_setup.sh  # If certificate needs to be recreated
```

### Issue 5: Site Not Accessible Externally
**Symptoms**: Works locally but not from internet
**Cause**: DNS not pointing to server or firewall blocking access
**Solution**:
```bash
./dns_firewall_check.sh
# Update DNS A record to point to server IP
sudo ufw allow 80
sudo ufw allow 443
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
