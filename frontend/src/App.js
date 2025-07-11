import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DataView from "./components/DataView";
import ScrapeStarter from "./components/ScrapeStarter";
import { fetchScrapedData } from "./api";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<DataView data={data} loading={loading} error={error} />} />
          <Route path="/start" element={<ScrapeStarter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
