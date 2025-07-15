// Google Analytics Verification Script
// Run this in your browser console when viewing your scraper app at http://localhost:3000

console.log("🔍 Starting Google Analytics verification...");

// Function to check GA setup
function verifyGoogleAnalytics() {
    console.log("\n=== GOOGLE ANALYTICS VERIFICATION ===");
    
    // Check basic setup
    console.log("\n1. Basic Setup Check:");
    console.log("✓ gtag function exists:", typeof gtag === 'function');
    console.log("✓ dataLayer exists:", !!window.dataLayer);
    console.log("✓ dataLayer length:", window.dataLayer ? window.dataLayer.length : 0);
    console.log("✓ GA initialized flag:", window.GA_INITIALIZED);
    
    // Check measurement ID
    console.log("\n2. Configuration Check:");
    const measurementId = process?.env?.REACT_APP_GA_MEASUREMENT_ID || "Not found";
    console.log("✓ Measurement ID from env:", measurementId);
    
    // Check if GA script is loaded
    const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
    console.log("✓ GA script loaded:", !!gaScript);
    if (gaScript) {
        console.log("  Script URL:", gaScript.src);
    }
    
    // Check dataLayer contents
    console.log("\n3. DataLayer Contents:");
    if (window.dataLayer && window.dataLayer.length > 0) {
        console.log("✓ DataLayer entries:", window.dataLayer.length);
        window.dataLayer.forEach((entry, index) => {
            console.log(`  [${index}]:`, entry);
        });
    } else {
        console.log("❌ DataLayer is empty or doesn't exist");
    }
    
    // Test the app's analytics functions
    console.log("\n4. Testing App Analytics Functions:");
    if (typeof window.testAnalytics === 'function') {
        console.log("✓ testAnalytics function available");
        const testResult = window.testAnalytics();
        console.log("✓ Test result:", testResult);
    } else {
        console.log("❌ testAnalytics function not available");
    }
    
    // Send a test event
    console.log("\n5. Sending Test Event:");
    if (typeof gtag === 'function') {
        gtag('event', 'verification_test', {
            event_category: 'Debug',
            event_label: 'Console_Verification',
            value: 1
        });
        console.log("✅ Test event sent to Google Analytics!");
        console.log("   Check GA Real-Time reports in 1-2 minutes");
    } else {
        console.log("❌ Cannot send test event - gtag not available");
    }
    
    // Final assessment
    console.log("\n6. Final Assessment:");
    const isWorking = typeof gtag === 'function' && 
                     window.dataLayer && 
                     window.dataLayer.length > 0 &&
                     measurementId !== "Not found" &&
                     measurementId !== "G-XXXXXXXXXX";
    
    if (isWorking) {
        console.log("🎉 GOOGLE ANALYTICS IS WORKING!");
        console.log("   Your events should appear in GA Real-Time reports");
        console.log("   Dashboard: https://analytics.google.com/analytics/web/#/p417946779/realtime/overview");
    } else {
        console.log("❌ GOOGLE ANALYTICS HAS ISSUES");
        console.log("   Check the problems listed above");
    }
    
    return isWorking;
}

// Also provide quick test functions
window.verifyGA = verifyGoogleAnalytics;
window.sendGATest = function() {
    gtag('event', 'manual_test', {
        event_category: 'Console_Test',
        event_label: 'Manual_Trigger',
        value: Math.floor(Math.random() * 100)
    });
    console.log("Test event sent! Check GA Real-Time in 1-2 minutes.");
};

// Run verification automatically
console.log("📋 Running automatic verification...");
verifyGoogleAnalytics();

console.log("\n🔧 Available functions:");
console.log("• verifyGA() - Run full verification again");
console.log("• sendGATest() - Send a test event");
console.log("• testAnalytics() - Run app's built-in test");

console.log("\n📊 Google Analytics Dashboard:");
console.log("https://analytics.google.com/analytics/web/#/p417946779/realtime/overview");
