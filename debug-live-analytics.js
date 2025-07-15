// Google Analytics Live Site Debug Script
// Copy and paste this into your browser console at https://sydneyscheduler.com/

console.log("🔍 Starting Google Analytics Live Site Debug...");
console.log("Site: " + window.location.href);
console.log("Time: " + new Date().toISOString());

// Basic GA setup check
console.log("\n=== 1. BASIC SETUP CHECK ===");
console.log("✓ gtag function exists:", typeof gtag === 'function');
console.log("✓ dataLayer exists:", !!window.dataLayer);
console.log("✓ dataLayer length:", window.dataLayer ? window.dataLayer.length : 0);
console.log("✓ GA_INITIALIZED:", window.GA_INITIALIZED);

// Check measurement ID
console.log("\n=== 2. MEASUREMENT ID CHECK ===");
// Try to extract GA ID from dataLayer or scripts
let foundGAID = null;
if (window.dataLayer) {
    window.dataLayer.forEach(item => {
        if (item[0] === 'config' && typeof item[1] === 'string' && item[1].startsWith('G-')) {
            foundGAID = item[1];
        }
    });
}

// Also check script tags
const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
gaScripts.forEach(script => {
    const match = script.src.match(/id=([^&]+)/);
    if (match && match[1].startsWith('G-')) {
        foundGAID = match[1];
    }
});

console.log("✓ Found GA Measurement ID:", foundGAID);
console.log("✓ Expected ID: G-DMDYBF56W7");
console.log("✓ IDs match:", foundGAID === 'G-DMDYBF56W7');

// Check if GA script loaded
console.log("\n=== 3. SCRIPT LOADING CHECK ===");
const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
console.log("✓ GA script tag found:", !!gaScript);
if (gaScript) {
    console.log("  Script URL:", gaScript.src);
}

// Check dataLayer contents
console.log("\n=== 4. DATALAYER CONTENTS ===");
if (window.dataLayer && window.dataLayer.length > 0) {
    console.log("DataLayer entries:", window.dataLayer.length);
    window.dataLayer.forEach((entry, index) => {
        console.log(`[${index}]:`, entry);
    });
} else {
    console.log("❌ DataLayer is empty");
}

// Test event sending
console.log("\n=== 5. SENDING TEST EVENTS ===");
if (typeof gtag === 'function') {
    // Send multiple test events
    console.log("Sending page_view event...");
    gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
    
    console.log("Sending custom test event...");
    gtag('event', 'debug_test', {
        event_category: 'Debug',
        event_label: 'Live_Site_Test',
        value: 1,
        custom_parameter: 'live_test_' + Date.now()
    });
    
    console.log("Sending engagement event...");
    gtag('event', 'user_engagement', {
        engagement_time_msec: 1000
    });
    
    console.log("✅ Test events sent! Check GA Real-Time in 1-2 minutes");
} else {
    console.log("❌ Cannot send events - gtag not available");
}

// Check for app-specific analytics functions
console.log("\n=== 6. APP ANALYTICS FUNCTIONS ===");
if (typeof window.testAnalytics === 'function') {
    console.log("✓ testAnalytics function available");
    try {
        const testResult = window.testAnalytics();
        console.log("Test result:", testResult);
    } catch (e) {
        console.log("❌ Error running testAnalytics:", e.message);
    }
} else {
    console.log("⚠️ testAnalytics function not available");
}

// Network check
console.log("\n=== 7. NETWORK CHECK ===");
console.log("Checking if requests to Google Analytics are being sent...");

// Monitor network requests
let gaRequestCount = 0;
const originalFetch = window.fetch;
const originalXHR = window.XMLHttpRequest.prototype.open;

// Intercept fetch requests
window.fetch = function(...args) {
    if (args[0] && args[0].includes('google-analytics.com')) {
        gaRequestCount++;
        console.log("📡 GA Fetch request detected:", args[0]);
    }
    return originalFetch.apply(this, args);
};

// Intercept XHR requests
window.XMLHttpRequest.prototype.open = function(method, url) {
    if (url && url.includes('google-analytics.com')) {
        gaRequestCount++;
        console.log("📡 GA XHR request detected:", url);
    }
    return originalXHR.apply(this, arguments);
};

// Check for Image requests (GA uses this)
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'IMG' && node.src && node.src.includes('google-analytics.com')) {
                gaRequestCount++;
                console.log("📡 GA Image request detected:", node.src);
            }
        });
    });
});

observer.observe(document, { childList: true, subtree: true });

setTimeout(() => {
    console.log(`📊 Total GA requests detected in 5 seconds: ${gaRequestCount}`);
    observer.disconnect();
}, 5000);

// Console warnings check
console.log("\n=== 8. CONSOLE WARNINGS CHECK ===");
console.log("Check browser console for any red errors or warnings");
console.log("Common issues:");
console.log("  - Ad blockers blocking GA requests");
console.log("  - CORS issues");
console.log("  - Invalid measurement ID");
console.log("  - Network connectivity issues");

// Final summary
console.log("\n=== 9. TROUBLESHOOTING STEPS ===");
console.log("1. Open Google Analytics Real-Time dashboard:");
console.log("   https://analytics.google.com/analytics/web/#/p417946779/realtime/overview");
console.log("");
console.log("2. Look for:");
console.log("   - Active users (should show '1' when you're on the site)");
console.log("   - Page views in real-time events");
console.log("   - Custom events (debug_test, user_engagement)");
console.log("");
console.log("3. If no data appears after 2-3 minutes:");
console.log("   - Disable ad blockers");
console.log("   - Check browser network tab for blocked requests");
console.log("   - Verify measurement ID in GA dashboard");
console.log("   - Try incognito/private browsing mode");
console.log("");
console.log("4. Data stream setup:");
console.log("   - In GA, go to Admin > Data Streams");
console.log("   - Verify 'sydneyscheduler.com' stream exists");
console.log("   - Check stream measurement ID matches G-DMDYBF56W7");

console.log("\n✅ Debug complete! Monitor console for network requests and check GA dashboard.");

// Return useful info
return {
    measurementId: foundGAID,
    gtagExists: typeof gtag === 'function',
    dataLayerLength: window.dataLayer ? window.dataLayer.length : 0,
    gaScriptLoaded: !!gaScript,
    timestamp: new Date().toISOString()
};
