import React, { useState, useEffect } from "react";
import axios from "axios";
import { trackScrapeRequest } from "../utils/analytics";

function ScrapeStarter() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  // Fetch last updated timestamp on mount and after scraping
  const fetchLastUpdated = async () => {
    try {
      const response = await axios.get("/results");
      // Try to get the latest timestamp from any site
      let ts = "";
      if (response.data && response.data.no5 && response.data.no5.timestamp) ts = response.data.no5.timestamp;
      else if (response.data && response.data.ginza && response.data.ginza.timestamp) ts = response.data.ginza.timestamp;
      else if (response.data && response.data.ginza479 && response.data.ginza479.timestamp) ts = response.data.ginza479.timestamp;
      if (ts) setLastUpdated(new Date(ts).toLocaleString());
    } catch (e) {
      setLastUpdated("");
    }
  };

  useEffect(() => {
    fetchLastUpdated();
  }, []);

  const handleStartScrape = async () => {
    setLoading(true);
    setMessage("");
    
    // Track scrape request
    trackScrapeRequest();
    
    try {
      await axios.get("/scrape");
      setMessage("Scraping finished! The results page now shows the latest data.");
      await fetchLastUpdated();
    } catch (error) {
      setMessage("Failed to start scraping: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Start Scraping</h2>
      <button className="btn btn-primary" onClick={handleStartScrape} disabled={loading}>
        {loading ? "Starting..." : "Start Scraping"}
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
      {lastUpdated && (
        <div className="alert alert-secondary mt-3">
          <strong>Last updated:</strong> {lastUpdated}
        </div>
      )}
    </div>
  );
}

export default ScrapeStarter;
