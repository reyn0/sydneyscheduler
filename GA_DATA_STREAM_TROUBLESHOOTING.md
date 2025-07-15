# 📊 Google Analytics Data Stream Troubleshooting

You can see GA initializing (`Google Analytics initialized with ID: G-DMDYBF56W7`) but no data in the dashboard. This is a common issue with several possible causes.

## 🔍 Most Likely Issues

### 1. **Data Stream Not Configured Properly**
- Go to [Google Analytics](https://analytics.google.com/)
- Navigate to **Admin** > **Data Streams**
- Verify you have a stream for `sydneyscheduler.com`
- Check that the **Measurement ID** matches `G-DMDYBF56W7`

### 2. **Timing Delay**
- Analytics data can take **2-5 minutes** to appear
- Real-time reports are not truly "instant"
- Try waiting 5-10 minutes after visiting your site

### 3. **Ad Blockers**
- Many ad blockers block Google Analytics
- Try testing in **incognito mode**
- Temporarily disable ad blockers
- Check browser console for blocked network requests

### 4. **Wrong Property/View**
- Ensure you're looking at the correct GA property
- Check that you're viewing the right time zone
- Verify you're in the **Real-Time** reports section

## 🧪 Immediate Testing Steps

### Step 1: Run Live Site Debug
1. Go to https://sydneyscheduler.com/
2. Open browser console (F12)
3. Copy/paste the debug script from `debug-live-analytics.js`
4. Check the output for any issues

### Step 2: Manual Event Testing
In your browser console at https://sydneyscheduler.com/:
```javascript
// Send test events
gtag('event', 'test_debug', {
  event_category: 'Manual_Test',
  event_label: 'Console_Test',
  value: 42
});

// Send page view
gtag('event', 'page_view', {
  page_title: 'Manual Test Page',
  page_location: window.location.href
});

console.log('Test events sent! Check GA Real-Time in 2-3 minutes');
```

### Step 3: Network Request Verification
1. Open browser **Network tab** (F12 > Network)
2. Filter by "analytics" or "google"
3. Refresh the page
4. Look for requests to:
   - `google-analytics.com`
   - `googletagmanager.com`
   - Should see successful (200) responses

## 🔧 Data Stream Setup Verification

### In Google Analytics Dashboard:

1. **Go to Admin**
   - Click the gear icon (⚙️) in bottom left

2. **Select Data Streams**
   - Under "Property" column, click "Data Streams"

3. **Verify Web Stream**
   - Should see a stream for `sydneyscheduler.com`
   - Measurement ID should be `G-DMDYBF56W7`
   - Status should be "Active"

4. **If No Stream Exists:**
   - Click "Add stream" > "Web"
   - Website URL: `https://sydneyscheduler.com`
   - Stream name: `Sydney Scheduler`
   - Copy the new Measurement ID and update your `.env`

### Enhanced Measurement Check:
In your data stream settings, ensure these are **enabled**:
- ✅ Page views
- ✅ Scrolls  
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement
- ✅ File downloads

## 📈 Real-Time Dashboard Check

### Where to Look:
1. **Real-Time Overview**: https://analytics.google.com/analytics/web/#/p417946779/realtime/overview
2. **Real-Time Events**: Look for events in the right panel
3. **Active Users**: Should show "1" when you're on the site

### What You Should See:
- **Users right now**: 1 (when you're on the site)
- **Page views**: Your current page
- **Events**: page_view, user_engagement, custom events
- **Top pages**: /
- **Traffic source**: Direct

## 🚨 Common Issues & Fixes

### Issue 1: Wrong Measurement ID
```bash
# Check your production .env
cat /srv/sydneyscheduler/frontend/.env

# Should contain:
REACT_APP_GA_MEASUREMENT_ID=G-DMDYBF56W7
```

### Issue 2: Build Issues
```bash
# Rebuild frontend with analytics
cd /srv/sydneyscheduler/frontend
npm run build
sudo systemctl restart nginx
```

### Issue 3: Firewall/Network
```bash
# Test if GA endpoints are reachable
curl -I https://www.google-analytics.com/
curl -I https://www.googletagmanager.com/
```

### Issue 4: Browser Issues
- Try different browsers (Chrome, Firefox, Safari)
- Test in incognito/private mode
- Clear browser cache and cookies
- Disable all browser extensions temporarily

## 🎯 Quick Verification Checklist

- [ ] Visited https://sydneyscheduler.com/ in last 5 minutes
- [ ] Console shows "Google Analytics initialized with ID: G-DMDYBF56W7"
- [ ] No errors in browser console
- [ ] Ad blockers disabled or in incognito mode
- [ ] Waiting at least 2-3 minutes for data to appear
- [ ] Looking at correct GA property (G-DMDYBF56W7)
- [ ] Viewing Real-Time reports (not other sections)
- [ ] Data stream exists for sydneyscheduler.com

## 🔍 Advanced Debugging

### Check GA Debug Mode
Add this to your site temporarily:
```javascript
gtag('config', 'G-DMDYBF56W7', {
  debug_mode: true
});
```

### Use GA Debugger Extension
- Install "Google Analytics Debugger" browser extension
- Enable it and visit your site
- Check console for detailed GA logs

### Verify Property Settings
In GA Admin:
- **Property Settings** > **Property Details**
- **Time zone**: Should match your location
- **Currency**: Should be appropriate
- **Data Retention**: Check settings

## 📞 If Still No Data

1. **Wait 24 hours** - Sometimes there are delays
2. **Create new measurement ID** - The current one might have issues
3. **Check GA Help Center** - Search for "data not appearing"
4. **Use GA Intelligence** - Ask questions in the GA dashboard

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Active users: 1 (in Real-Time)
- ✅ Page views appearing in Real-Time
- ✅ Events in the Events section
- ✅ Your site URL in "Top pages"

The data **will** appear once everything is configured correctly! 🚀
