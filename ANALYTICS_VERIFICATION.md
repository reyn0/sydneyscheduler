# 🔍 Google Analytics Verification Guide

Your Google Analytics integration is properly set up! Here's how to verify it's working:

## ✅ Current Setup Status

- **Measurement ID**: `G-DMDYBF56W7` (correctly stored in `.env`)
- **Integration**: Environment variable based (secure)
- **Code**: Clean template in GitHub (no hardcoded IDs)
- **Analytics file**: `frontend/src/utils/analytics.js`

## 🧪 Testing Methods

### Method 1: Test Page (Recommended)
1. Open: `frontend/test-analytics.html` in your browser
2. Click "Check GA Setup" - should show all ✅ green checkmarks
3. Click "Send Test Event" - sends test data to GA
4. Click "View Real-Time GA" - opens your analytics dashboard

### Method 2: Main App Console Test
1. Go to your main app: `http://localhost:3000`
2. Open browser console (F12)
3. Run: `testAnalytics()` (built into your app)
4. Or copy/paste the verification script from `verify-analytics.js`

### Method 3: Browser Console Commands
When on your main app page, try these commands:
```javascript
// Check if GA is loaded
console.log(typeof gtag === 'function')

// Send test event
gtag('event', 'test', {
  event_category: 'Test',
  event_label: 'Manual_Test'
})

// Run built-in test
testAnalytics()
```

## 📊 Viewing Results

### Google Analytics Dashboard
- **Real-Time**: https://analytics.google.com/analytics/web/#/p417946779/realtime/overview
- **Events**: Look for your test events in "Events" section
- **Timing**: Events appear within 1-2 minutes

### What to Look For
- Page views when you visit your site
- Custom events when you test
- Real-time user count should show "1" when you're testing

## 🔧 Troubleshooting

### If Events Don't Appear
1. **Check Console**: Look for any error messages
2. **Verify ID**: Ensure `G-DMDYBF56W7` is in your `.env` file
3. **Clear Cache**: Refresh browser and clear cache
4. **Ad Blockers**: Disable ad blockers temporarily
5. **Network**: Check if requests to `googletagmanager.com` are blocked

### Console Errors to Fix
- `gtag is not defined` → GA script not loaded
- `REACT_APP_GA_MEASUREMENT_ID undefined` → Check `.env` file
- `Failed to load resource` → Network/firewall issue

## 🚀 Production Verification

When deployed to your VPS:
1. Visit: `https://sydneyscheduler.com`
2. Run same tests in browser console
3. Check GA Real-Time dashboard
4. Verify events from real users

## 🔐 Security Notes

- ✅ Real GA ID only in `.env` (never committed)
- ✅ Template ID in code (`G-XXXXXXXXXX`)
- ✅ Environment variable approach
- ✅ `.env` in `.gitignore`

## 📈 Event Tracking

Your app automatically tracks:
- **Page Views**: When users visit
- **Roster Views**: When viewing different sites
- **Searches**: When users search
- **Sorts**: When users sort data
- **Scrape Requests**: When scraping is triggered
- **Coffee Clicks**: When "Buy me coffee" is clicked
- **Filters**: When users filter data

## 🎯 Next Steps

1. **Test Now**: Use the test page or console methods above
2. **Verify Real-Time**: Check GA dashboard for events
3. **Monitor**: Keep an eye on analytics data over time
4. **Custom Events**: Add more tracking as needed

Your Google Analytics is ready to go! 🎉
