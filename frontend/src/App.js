import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import DataView from "./components/DataView";
import ScrapeStarter from "./components/ScrapeStarter";
import { fetchScrapedData } from "./api";
import { initGA, trackPageView, trackCoffeeClick, testAnalytics } from "./utils/analytics";

// Simple Buy Me a Coffee Button Component
function BuyMeACoffeeButton() {
  const handleClick = () => {
    trackCoffeeClick();
  };

  return (
    <a
      href="https://www.buymeacoffee.com/sydneyscheduler"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '7px 15px',
        backgroundColor: '#5F7FFF',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'Lato, sans-serif',
        fontWeight: '500',
        border: '1px solid #000000',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = '#4a6bff';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = '#5F7FFF';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <span style={{ marginRight: '8px' }}>☕</span>
      Buy me a coffee
    </a>
  );
}

// Component to track page views
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Google Analytics on app load
  useEffect(() => {
    initGA();
    
    // Add test function to window for easy debugging
    window.testAnalytics = testAnalytics;
    console.log('Analytics test function available: window.testAnalytics()');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchScrapedData();
        setData(result);
      } catch (err) {
        setError(err.message || "Unknown error");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Router>
      <Analytics />
      <div className="container mt-4">
        {/* Header with title and coffee button */}
        <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h1 className="h3 mb-0" style={{ color: "#1976d2" }}>Sydney Roster Scheduler</h1>
            <small className="text-muted">Real-time roster aggregation from multiple venues</small>
          </div>
          <div>
            <BuyMeACoffeeButton />
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DataView data={data} loading={loading} error={error} />} />
          <Route path="/start" element={<ScrapeStarter />} />
        </Routes>
        
        {/* Footer */}
        <footer className="text-center mt-5 pt-4 border-top">
          <small className="text-muted">
            Last updated: {data?.no5?.timestamp ? new Date(data.no5.timestamp).toLocaleString() : 'Never'}
          </small>
        </footer>
      </div>
    </Router>
  );
}

export default App;