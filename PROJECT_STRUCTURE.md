# 📁 Project Structure

Clean, production-ready project structure after successful deployment:

```
my-scraper-app/
├── .git/                           # Git repository
├── .gitignore                      # Comprehensive ignore rules
├── README.md                       # Main project documentation
├── cleanup.sh                     # Project cleanup script
│
├── backend/                        # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application with CORS
│   │   └── scraper.py              # Multi-site web scraping with deduplication
│   ├── requirements.txt            # Python dependencies (FastAPI, Selenium, etc.)
│   └── latest_results.json         # Persistent scraped data storage
│
├── frontend/                       # React frontend application
│   ├── .env                        # Production environment variables
│   ├── .env.example               # Environment template for setup
│   ├── package.json               # Node.js dependencies and scripts
│   ├── package-lock.json          # Dependency lock file
│   ├── public/
│   │   ├── index.html             # HTML template
│   │   └── favicon.ico            # Site favicon
│   ├── src/
│   │   ├── App.js                 # Main React component with analytics
│   │   ├── index.js               # React application entry point
│   │   ├── api.js                 # Backend API client functions
│   │   ├── components/
│   │   │   ├── DataView.js        # Roster display with filtering/sorting
│   │   │   └── ScrapeStarter.js   # Manual scraping interface
│   │   └── utils/
│   │       └── analytics.js       # Google Analytics 4 integration
│   ├── build/                     # Production build output
│   └── node_modules/              # Node.js dependencies
│
├── docs/                          # Project documentation
│   ├── TROUBLESHOOTING.md         # Deployment and system troubleshooting
│   ├── PROJECT_STRUCTURE.md       # This file - project organization
│   └── SECURITY.md                # Security best practices and guidelines
│
└── deployment-scripts/            # Production deployment automation
    ├── verify_production_analytics.sh  # Analytics setup verification
    ├── setup_cron.sh                  # Automated scraping configuration
    ├── monitor_cron.sh                # Cron job monitoring dashboard
    ├── debug_cron.sh                  # Cron troubleshooting diagnostics
    ├── test_scraping.sh               # Manual scraping test utility
    ├── production_build.sh            # Frontend production build
    ├── ssl_setup.sh                   # SSL certificate setup and renewal
    ├── ssl_troubleshoot.sh           # SSL diagnostics and fixes
    ├── nginx_fix.sh                   # Nginx configuration repair
    ├── webscraper_fix.sh             # Backend service troubleshooting
    ├── dns_firewall_check.sh         # Network connectivity diagnostics
    └── fix_port_443.sh               # HTTPS port troubleshooting
```

## 🗂️ Key Directory Explanations

### `/backend/`
- **Production-ready FastAPI application**
- **Multi-site scraping** with Selenium WebDriver
- **Smart deduplication** preserving separate daily rosters
- **JSON persistence** for scraped data
- **CORS configuration** for frontend integration

### `/frontend/`
- **Modern React application** with Bootstrap styling
- **Google Analytics 4** integration with environment variables
- **Advanced filtering and sorting** for roster data
- **Responsive design** for mobile and desktop
- **API integration** with loading states and error handling

### `/deployment-scripts/`
- **Automated deployment** tools for DigitalOcean VPS
- **Comprehensive diagnostics** for troubleshooting
- **SSL/HTTPS setup** with Let's Encrypt
- **Cron job management** for automated scraping
- **Production monitoring** and health checks

### `/docs/`
- **Complete documentation** for setup and troubleshooting
- **Security guidelines** and best practices
- **Deployment instructions** and common issues

## 🔄 Data Flow

```
Cron Schedule → Backend Scraper → JSON Storage → Frontend API → User Interface
     ↓              ↓                ↓              ↓              ↓
   Every 4-6     Selenium +      latest_results   React App    Google Analytics
    hours      BeautifulSoup        .json        + Bootstrap      Events
```

## 🛠️ Development vs Production

### Development
- Local environment with hot reload
- Development server on localhost:3000
- Template GA ID (G-XXXXXXXXXX)
- Direct API calls to localhost:8000

### Production
- Nginx reverse proxy with SSL
- Static file serving from `/var/www/html`
- Real GA ID from environment variables
- Systemd service for backend
- Automated cron jobs for scraping

## 📊 File Sizes (Typical)

- **Source code**: ~50 KB
- **Dependencies**: ~200 MB (node_modules + Python packages)
- **Production build**: ~2 MB
- **Scraped data**: ~100-500 KB (depending on roster size)
- **Log files**: Variable (rotated automatically)

## 🔐 Security Considerations

- ✅ Environment variables for sensitive data
- ✅ `.gitignore` protects credentials and build artifacts
- ✅ SSL/TLS encryption in production
- ✅ No hardcoded API keys or measurement IDs
- ✅ Secure file permissions on server
- ✅ Regular security updates via package managers

This structure ensures maintainability, scalability, and security for the production deployment.

```
my-scraper-app/
├── .git/                           # Git repository
├── .gitignore                      # Comprehensive ignore rules
├── README.md                       # Main project documentation
│
├── backend/                        # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   └── scraper.py              # Web scraping logic
│   ├── requirements.txt            # Python dependencies
│   └── latest_results.json         # Persistent scraped data
│
├── frontend/                       # React frontend
│   ├── .env                        # Environment variables (template)
│   ├── .env.example               # Environment template
│   ├── package.json               # Node.js dependencies
│   ├── package-lock.json          # Lock file
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── App.js                 # Main React component
│   │   ├── index.js               # React entry point
│   │   ├── api.js                 # API client
│   │   ├── components/
│   │   │   ├── DataView.js        # Roster display component
│   │   │   └── ScrapeStarter.js   # Manual scraping trigger
│   │   └── utils/
│   │       └── analytics.js       # Google Analytics integration
│   ├── build/                     # Production build (generated)
│   └── node_modules/              # Dependencies (auto-generated)
│
├── GOOGLE_ANALYTICS.md            # Analytics setup guide
├── TROUBLESHOOTING.md             # Deployment troubleshooting
│
└── deployment-scripts/            # Server deployment scripts
    ├── production_build.sh        # Production build script
    ├── final_verification.sh      # Deployment verification
    ├── dns_firewall_check.sh      # Network diagnostics
    ├── nginx_fix.sh               # Nginx configuration fix
    ├── ssl_setup.sh               # SSL certificate setup
    ├── ssl_troubleshoot.sh        # SSL diagnostics
    ├── webscraper_fix.sh          # Backend service fix
    └── fix_port_443.sh            # Port 443 troubleshooting
```

## Removed Files

The following unnecessary files were removed:

### Debug/Temporary Files:
- `debug_ginza_structure.py` - Debug script
- `backend/today_container.json` - Debug data
- `backend/tomorrow_container.json` - Debug data

### Redundant Documentation:
- `frontend/README.md` - Default React README
- `backend/README.md` - Basic backend README

### Redundant Configuration:
- `nginx_https_config.conf` - Standalone config (integrated into scripts)
- `quick_https_fix.sh` - Functionality moved to other scripts
- `ssl_quick_fix.sh` - Redundant SSL script
- `https_diagnostic.sh` - Functionality in dns_firewall_check.sh

## Production Deployment

The cleaned project is now ready for production with:
- ✅ Minimal file structure
- ✅ Comprehensive .gitignore
- ✅ Organized deployment scripts
- ✅ Clear documentation
- ✅ No debug/temp files
- ✅ Security-conscious environment handling
