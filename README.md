# 🕸️ Sydney Scheduler - Web Scraper App

A robust full-stack web application that aggregates and displays rosters from multiple Sydney venues. Features real-time scraping, intelligent deduplication, and automated scheduling.

## 🌟 Features

- **Multi-Site Scraping**: Aggregates rosters from Ginza Club and other venues
- **Smart Deduplication**: Eliminates duplicate entries while preserving separate daily rosters  
- **Real-Time Updates**: Automated scraping every few hours via cron jobs
- **Modern UI**: React frontend with filtering, sorting, and search capabilities
- **Analytics Integration**: Google Analytics 4 for usage tracking
- **Production Ready**: Deployed on DigitalOcean with SSL, Nginx, and systemd

## 🏗️ Architecture

- **Backend**: FastAPI + Selenium WebDriver + BeautifulSoup
- **Frontend**: React + Bootstrap + Google Analytics
- **Database**: JSON file storage with persistent results
- **Deployment**: DigitalOcean VPS with Nginx reverse proxy
- **Automation**: Cron jobs for scheduled scraping

## 🚀 Live Demo

**Production Site**: https://sydneyscheduler.com/

## 📋 Quick Start

### Local Development

1. **Backend Setup**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### Production Deployment

See `deployment-scripts/` for automated deployment tools:

```bash
# Deploy to production server
./deployment-scripts/production_build.sh

# Setup SSL certificates
./deployment-scripts/ssl_setup.sh

# Configure automated scraping
./deployment-scripts/setup_cron.sh
```

## 📊 Monitoring & Analytics

- **Google Analytics**: Integrated with secure environment variables
- **Cron Monitoring**: `./deployment-scripts/monitor_cron.sh`
- **System Health**: `./deployment-scripts/verify_production_analytics.sh`

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**:
```bash
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_API_URL=https://sydneyscheduler.com
```

**Backend**: No environment variables required

### Cron Schedule

Scraping runs automatically at:
- 8:00 AM (08:00)
- 2:00 PM (14:00) 
- 6:00 PM (18:00)
- 7:00 PM (19:00)

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   └── scraper.py       # Web scraping logic
│   ├── requirements.txt
│   └── latest_results.json  # Persistent storage
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Analytics & API utilities
│   │   └── App.js          # Main application
│   ├── public/
│   └── package.json
├── deployment-scripts/      # Production deployment tools
└── docs/                   # Documentation
```

## 🛠️ Troubleshooting

Common issues and solutions:

- **Cron Jobs**: See `TROUBLESHOOTING.md` and run `./deployment-scripts/debug_cron.sh`
- **Analytics**: Run `./deployment-scripts/verify_production_analytics.sh`
- **SSL Issues**: Use `./deployment-scripts/ssl_troubleshoot.sh`
- **General Deployment**: Check `TROUBLESHOOTING.md`

## 🔐 Security

- Environment variables for sensitive data
- SSL/TLS encryption in production
- No hardcoded credentials in source code
- See `SECURITY.md` for best practices

## 📈 Analytics & Tracking

The app tracks:
- Page views and user engagement
- Search and filter usage
- Scraping requests and roster views
- Performance metrics

All analytics respect user privacy and use secure, environment-based configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally and in production
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Run diagnostic scripts in `deployment-scripts/`
3. Review logs: `sudo journalctl -u webscraper.service`

---

**Status**: ✅ Production Ready | **Last Updated**: December 2024
