// Replace with your actual Google Analytics 4 Measurement ID
// Get this from Google Analytics dashboard (looks like G-XXXXXXXXXX)
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize dataLayer and gtag function immediately
window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}
window.gtag = gtag;

// Initialize Google Analytics
export const initGA = () => {
  // Only initialize in production or when measurement ID is properly set
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('Google Analytics not initialized - no valid measurement ID');
    return;
  }

  // Prevent double initialization
  if (window.GA_INITIALIZED) {
    console.log('Google Analytics already initialized');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag with config
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    // Enhanced measurement settings
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
    // Enable enhanced measurement
    custom_map: {},
    // Debug mode for testing (remove in production if needed)
    debug_mode: false
  });

  // Mark as initialized
  window.GA_INITIALIZED = true;
  console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
  
  // Send initial page view
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href
  });
};

// Track page views
export const trackPageView = (url, title) => {
  if (typeof window.gtag === 'function' && window.GA_INITIALIZED) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
    // Also send explicit page_view event
    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: window.location.origin + url
    });
  }
};

// Track custom events
export const trackEvent = (action, category = 'General', label = '', value = 0) => {
  if (typeof window.gtag === 'function' && window.GA_INITIALIZED) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log(`Analytics Event: ${action} | ${category} | ${label}`);
  } else {
    console.log(`Analytics not ready - would track: ${action} | ${category} | ${label}`);
  }
};

// Track specific events for your site
export const trackRosterView = (site) => {
  trackEvent('roster_view', 'Roster', site);
};

export const trackSearch = (searchTerm) => {
  trackEvent('search', 'User_Interaction', searchTerm);
};

export const trackSort = (sortBy) => {
  trackEvent('sort', 'User_Interaction', sortBy);
};

export const trackScrapeRequest = () => {
  trackEvent('scrape_request', 'API', 'Manual_Scrape');
};

export const trackCoffeeClick = () => {
  trackEvent('click', 'Support', 'Buy_Me_Coffee');
};

export const trackFilter = (filterType, filterValue) => {
  trackEvent('filter', 'User_Interaction', `${filterType}:${filterValue}`);
};

// Debug function to test analytics
export const testAnalytics = () => {
  console.log('=== Analytics Debug Test ===');
  console.log('GA_MEASUREMENT_ID:', GA_MEASUREMENT_ID);
  console.log('window.gtag exists:', typeof window.gtag === 'function');
  console.log('window.GA_INITIALIZED:', window.GA_INITIALIZED);
  console.log('window.dataLayer:', window.dataLayer);
  
  if (typeof window.gtag === 'function') {
    console.log('Sending test event...');
    trackEvent('test_event', 'Debug', 'Analytics_Test', 1);
    console.log('Test event sent!');
  } else {
    console.log('gtag not available - analytics not working');
  }
  
  return {
    measurementId: GA_MEASUREMENT_ID,
    gtagExists: typeof window.gtag === 'function',
    initialized: window.GA_INITIALIZED,
    dataLayerLength: window.dataLayer ? window.dataLayer.length : 0
  };
};
