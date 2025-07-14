# Google Analytics Integration Guide

This guide explains how to set up Google Analytics 4 (GA4) tracking for your Sydney Roster Scheduler application.

## 🚀 Quick Setup

### Step 1: Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Create a new account (e.g., "Sydney Scheduler")
5. Create a new property (e.g., "sydneyscheduler.com")
6. Choose "Web" as the platform
7. Enter your website URL: `https://sydneyscheduler.com`

### Step 2: Get Your Measurement ID
1. In GA4 dashboard, go to **Admin** (gear icon)
2. Under **Property**, click **Data Streams**
3. Click on your web stream
4. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Step 3: Configure Your Application
1. Open `frontend/.env` file
2. Replace `G-XXXXXXXXXX` with your actual Measurement ID:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
   ```

### Step 4: Test Locally
1. Start your development server:
   ```bash
   cd frontend
   npm start
   ```
2. Open browser console and check for "Google Analytics initialized" message
3. The app should start without import errors

### Step 5: Deploy and Verify
1. Rebuild your frontend:
   ```bash
   npm run build
   ```
2. Copy the build to your server:
   ```bash
   sudo cp -r build/* /srv/sydneyscheduler/frontend/build/
   ```
3. Visit your site and check Google Analytics Real-time reports

## 📊 What Gets Tracked

The integration automatically tracks:

### Page Views
- Home page visits (`/`)
- Scrape starter page visits (`/start`)
- URL changes and navigation

### User Interactions
- **Search queries**: When users search the roster tables
- **Column sorting**: When users click column headers to sort
- **Filter actions**: When users clear filters or reset to original order
- **Roster tab changes**: When users switch between Today/Tomorrow tabs
- **Site interactions**: When users view different venue rosters
- **Scrape requests**: When users manually trigger scraping
- **Support clicks**: When users click "Buy me a coffee"

### Custom Events Tracked
- `roster_view`: Which site/day combination users view most
- `search`: What terms users search for
- `sort`: How users prefer to sort the data
- `scrape_request`: Manual scraping frequency
- `click`: Support button interactions
- `filter`: Filter usage patterns

## 🎯 Analytics Benefits

### User Behavior Insights
- **Most popular sites**: Which venues get the most views
- **Search patterns**: What users are looking for
- **Usage times**: When your site is most active
- **Mobile vs Desktop**: Device usage breakdown

### Performance Metrics
- **Page load times**: How fast your site loads
- **Bounce rate**: User engagement levels
- **Session duration**: How long users stay
- **Return visitors**: User retention rates

### Business Intelligence
- **Traffic sources**: Where users come from
- **Geographic data**: Where your users are located
- **Popular content**: Which features are used most
- **Conversion tracking**: Support button click rates

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Production
REACT_APP_GA_MEASUREMENT_ID=G-YOUR-PRODUCTION-ID

# Staging (optional)
REACT_APP_GA_MEASUREMENT_ID=G-YOUR-STAGING-ID
```

### Privacy Considerations
The current setup:
- ✅ Respects user privacy
- ✅ No personal data collection
- ✅ Anonymous usage tracking only
- ✅ Complies with basic privacy standards

For GDPR compliance, consider adding:
- Cookie consent banner
- Privacy policy page
- User opt-out functionality

### Testing Analytics
1. **Real-time reports**: Check GA4 Real-time section
2. **Browser console**: Look for analytics initialization messages
3. **GA4 DebugView**: Enable debug mode for detailed event tracking
4. **Chrome extension**: Use Google Analytics Debugger extension

**Testing in Browser Console:**
```javascript
// Test if analytics is working
console.log('dataLayer exists:', typeof window.dataLayer !== 'undefined');
console.log('gtag function exists:', typeof window.gtag !== 'undefined');

// Test custom event
if (typeof window.gtag === 'function') {
  window.gtag('event', 'test_event', {
    event_category: 'Test',
    event_label: 'Console_Test'
  });
  console.log('Test event sent');
}
```

**Best Practice**: Delete any test files after debugging to keep the codebase clean.

## 🛠️ Troubleshooting

### Common Issues

**Analytics not working:**
- Check Measurement ID is correct in `.env`
- Verify the site is rebuilt after changing `.env`
- Check browser console for errors
- Ensure site is accessible via HTTPS

**Events not tracking:**
- Verify analytics initialization in browser console
- Check if ad blockers are interfering
- Test in incognito mode
- Check GA4 Real-time reports (events may take 24-48 hours in standard reports)

**Data discrepancies:**
- Internal traffic (your own visits) may inflate numbers
- Bot traffic can affect metrics
- Consider setting up filters in GA4

### Debug Mode
To enable debug mode, add this to your analytics.js:
```javascript
gtag('config', GA_MEASUREMENT_ID, {
  debug_mode: true  // Only for testing
});
```

## 📈 Optimization Tips

### Enhanced Tracking
Consider adding:
- User scrolling behavior
- Click heatmaps (via additional tools)
- Form interactions
- Error tracking
- Performance monitoring

### Data Analysis
- Set up custom dashboards in GA4
- Create alerts for traffic spikes
- Monitor site performance metrics
- Track conversion goals

### Privacy Best Practices
- Add privacy policy
- Consider cookie consent
- Anonymize IP addresses
- Respect Do Not Track headers

## 🔄 Maintenance

### Regular Tasks
- Monitor analytics data weekly
- Review popular content monthly
- Update tracking based on new features
- Check for analytics updates/changes

### Data Retention
- GA4 retains data for 14 months by default
- Export important data for longer retention
- Set up automated reports for stakeholders

## 📞 Support

If you need help with Google Analytics setup:
1. Check the [GA4 documentation](https://support.google.com/analytics/topic/9143232)
2. Use the GA4 setup assistant in your account
3. Review the browser console for error messages
4. Test in different browsers and devices

The analytics integration is designed to be lightweight and privacy-friendly while providing valuable insights into how users interact with your roster aggregation site.
