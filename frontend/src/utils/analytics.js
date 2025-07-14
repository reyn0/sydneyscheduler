// Replace with your actual Google Analytics 4 Measurement ID
// Get this from Google Analytics dashboard (looks like G-XXXXXXXXXX)
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  // Only initialize in production or when measurement ID is properly set
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('Google Analytics not initialized - no valid measurement ID');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    // Enhanced measurement settings
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });

  console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (url, title) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
  }
};

// Track custom events
export const trackEvent = (action, category = 'General', label = '', value = 0) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
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
