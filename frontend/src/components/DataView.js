import React, { useState, useMemo } from "react";
import { trackSearch, trackSort, trackRosterView, trackFilter } from "../utils/analytics";

function parseNameTime(entry) {
  let code = "";
  let name = "";
  let start = "";
  let finish = "";
  if (typeof entry === "object" && entry.name && entry.time) {
    // No5
    const specialCodes = ["First Day", "French", "Turkish"];
    const specialMatch = specialCodes.find((c) => entry.name.startsWith(c));
    if (specialMatch) {
      code = specialMatch;
      name = entry.name.replace(
        new RegExp(`^${specialMatch}[- ]*`, "i"),
        ""
      ).trim();
    } else {
      const codeMatch = entry.name.match(/^([A-Za-z]{1,5}|[A-Za-z]{2,5})\s+/);
      if (codeMatch) {
        code = codeMatch[1];
        name = entry.name.replace(codeMatch[0], "").trim();
      } else {
        name = entry.name;
      }
    }
    // Improved time extraction: allow 10:30am, 10.30am, 10:30 am, etc.
    const match = entry.time.match(
      /(\d{1,2}([:.]\d{2})? ?[ap]m)[^\d]*(\d{1,2}([:.]\d{2})? ?[ap]m)/i
    );
    if (match) {
      start = match[1].replace(/\s+/g, "");
      finish = match[3].replace(/\s+/g, "");
    } else {
      start = entry.time;
    }
  } else if (typeof entry === "string") {
    // Ginza and 479 Ginza
    // Check for 'French' as a code
    let rest = entry;
    let codeMatch = entry.match(/^([A-Za-z]{1,5})\s+/);
    if (entry.startsWith("French ")) {
      code = "French";
      rest = entry.replace(/^French\s+/, "");
    } else if (codeMatch) {
      code = codeMatch[1];
      rest = entry.replace(codeMatch[0], "");
    }
    // Improved time extraction: allow 10:30am, 10.30am, 10:30 am, etc.
    const timeMatch = rest.match(/(\d{1,2}([:.]\d{2})? ?[ap]m)[^\d]*(\d{1,2}([:.]\d{2})? ?[ap]m)/i);
    if (timeMatch) {
      name = rest.replace(timeMatch[0], "").trim();
      start = timeMatch[1].replace(/\s+/g, "");
      finish = timeMatch[3].replace(/\s+/g, "");
    } else {
      name = rest.trim();
    }
  }
  return { code, name, start, finish };
}

function RosterTable({ entries }) {
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("start");
  const [sortDirection, setSortDirection] = useState("asc");

  // Parse all entries first
  const parsedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return entries.map((entry, idx) => ({
      ...parseNameTime(entry),
      originalIndex: idx,
      originalEntry: entry
    }));
  }, [entries]);

  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!filter.trim()) return parsedEntries;
    
    const searchTerm = filter.toLowerCase().trim();
    return parsedEntries.filter(entry => 
      entry.code.toLowerCase().includes(searchTerm) ||
      entry.name.toLowerCase().includes(searchTerm) ||
      entry.start.toLowerCase().includes(searchTerm) ||
      entry.finish.toLowerCase().includes(searchTerm)
    );
  }, [parsedEntries, filter]);

  // Sort entries
  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries];
    
    // If sortField is "original", preserve the original backend order
    if (sortField === "original") {
      sorted.sort((a, b) => {
        return sortDirection === "asc" ? 
          a.originalIndex - b.originalIndex : 
          b.originalIndex - a.originalIndex;
      });
      return sorted;
    }
    
    sorted.sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";
      
      // Special handling for time sorting
      if (sortField === "start" || sortField === "finish") {
        // Convert time to 24-hour format for proper sorting
        const timeToMinutes = (timeStr) => {
          if (!timeStr) return 0;
          const match = timeStr.match(/(\d{1,2})(?:[:.:](\d{2}))?\s*([ap])m/i);
          if (!match) return 0;
          
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2] || "0");
          const period = match[3].toLowerCase();
          
          if (period === 'p' && hours !== 12) hours += 12;
          if (period === 'a' && hours === 12) hours = 0;
          
          return hours * 60 + minutes;
        };
        
        aValue = timeToMinutes(aValue);
        bValue = timeToMinutes(bValue);
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredEntries, sortField, sortDirection]);

  const handleSort = (field) => {
    // Track sort action
    trackSort(field);
    
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const clearFilter = () => {
    setFilter("");
    trackFilter("clear", "");
  };

  const resetToOriginalOrder = () => {
    setSortField("original");
    setSortDirection("asc");
    trackSort("original_order");
  };

  // Track search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    
    // Simple debounce - only track after user stops typing for 500ms
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      if (value.trim()) {
        trackSearch(value.trim());
      }
    }, 500);
  };

  return (
    <div>
      {/* Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, code, or time..."
              value={filter}
              onChange={handleSearchChange}
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button" 
              onClick={clearFilter}
              disabled={!filter.trim()}
            >
              Clear
            </button>
            <button 
              className="btn btn-outline-primary" 
              type="button" 
              onClick={resetToOriginalOrder}
              disabled={sortField === "original"}
              title="Reset to original backend order"
            >
              Original Order
            </button>
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-center">
          <small className="text-muted">
            Showing {sortedEntries.length} of {parsedEntries.length} entries
            {sortField === "original" && " (original order)"}
            {sortField !== "original" && ` (sorted by ${sortField})`}
          </small>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th 
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => handleSort("code")}
              className={sortField === "code" ? "table-active" : ""}
            >
              Code {getSortIcon("code")}
            </th>
            <th 
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => handleSort("name")}
              className={sortField === "name" ? "table-active" : ""}
            >
              Name {getSortIcon("name")}
            </th>
            <th 
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => handleSort("start")}
              className={sortField === "start" ? "table-active" : ""}
            >
              Start {getSortIcon("start")}
            </th>
            <th 
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => handleSort("finish")}
              className={sortField === "finish" ? "table-active" : ""}
            >
              Finish {getSortIcon("finish")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.length > 0 ? (
            sortedEntries.map((entry, idx) => (
              <tr key={entry.originalIndex}>
                <td>{entry.code}</td>
                <td>{entry.name}</td>
                <td>{entry.start}</td>
                <td>{entry.finish}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                {filter.trim() ? "No entries match your search" : "No data"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Disclaimer */}
      <div className="mt-2">
        <small className="text-muted fst-italic">
          ⚠️ This may not be 100% accurate and may have added or missing persons. 
          Please go to the original website to verify the real roster.
        </small>
      </div>
    </div>
  );
}

function No5Roster({ site, lastUpdated }) {
  const [tab, setTab] = useState("today");
  const { today, tomorrow, title } = site;
  
  const handleTabChange = (newTab) => {
    setTab(newTab);
    trackRosterView(`${title}-${newTab}`);
  };
  
  // Determine the date string from lastUpdated
  let dateStr = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "";
  let tomorrowDateStr = lastUpdated ? new Date(Date.parse(lastUpdated) + 24*60*60*1000).toLocaleDateString() : "";
  return (
    <div className="roster-data" style={{ marginBottom: 40 }}>
      <h2 style={{ color: "#1976d2" }}>{title}</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => handleTabChange("today")}
          className={`btn btn-sm ${
            tab === "today" ? "btn-primary" : "btn-outline-primary"
          }`}
          style={{ marginRight: 8 }}
        >
          Today's Roster{dateStr && ` (${dateStr})`}
        </button>
        <button
          onClick={() => handleTabChange("tomorrow")}
          className={`btn btn-sm ${
            tab === "tomorrow" ? "btn-primary" : "btn-outline-primary"
          }`}
        >
          Tomorrow's Roster{tomorrowDateStr && ` (${tomorrowDateStr})`}
        </button>
      </div>
      <RosterTable entries={tab === "today" ? today : tomorrow} />
    </div>
  );
}

function GinzaRoster({ site, lastUpdated }) {
  const { rosters, title } = site;
  const [tab, setTab] = useState("today");
  
  const handleTabChange = (newTab) => {
    setTab(newTab);
    trackRosterView(`${title}-${newTab}`);
  };
  
  const todayBlock = rosters && rosters.length > 0 ? rosters[0] : null;
  const tomorrowBlock = rosters && rosters.length > 1 ? rosters[1] : null;
  let dateStr = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "";
  let tomorrowDateStr = lastUpdated ? new Date(Date.parse(lastUpdated) + 24*60*60*1000).toLocaleDateString() : "";
  return (
    <div className="roster-data" style={{ marginBottom: 40 }}>
      <h2 style={{ color: "#1976d2" }}>{title}</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => handleTabChange("today")}
          className={`btn btn-sm ${
            tab === "today" ? "btn-primary" : "btn-outline-primary"
          }`}
          style={{ marginRight: 8 }}
        >
          Today's Roster{dateStr && ` (${dateStr})`}
        </button>
        <button
          onClick={() => handleTabChange("tomorrow")}
          className={`btn btn-sm ${
            tab === "tomorrow" ? "btn-primary" : "btn-outline-primary"
          }`}
        >
          Tomorrow's Roster{tomorrowDateStr && ` (${tomorrowDateStr})`}
        </button>
      </div>
      <RosterTable entries={tab === "today" ? (todayBlock ? todayBlock.names : []) : (tomorrowBlock ? tomorrowBlock.names : [])} />
    </div>
  );
}

function Ginza479Roster({ site, lastUpdated }) {
  const { rosters, title } = site;
  const [tab, setTab] = useState("today");
  const todayBlock = rosters && rosters.length > 0 ? rosters[0] : null;
  const tomorrowBlock = rosters && rosters.length > 1 ? rosters[1] : null;
  let dateStr = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "";
  let tomorrowDateStr = lastUpdated ? new Date(Date.parse(lastUpdated) + 24*60*60*1000).toLocaleDateString() : "";
  return (
    <div className="roster-data" style={{ marginBottom: 40 }}>
      <h2 style={{ color: "#1976d2" }}>{title}</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setTab("today")}
          className={`btn btn-sm ${
            tab === "today" ? "btn-primary" : "btn-outline-primary"
          }`}
          style={{ marginRight: 8 }}
        >
          Today's Roster{dateStr && ` (${dateStr})`}
        </button>
        <button
          onClick={() => setTab("tomorrow")}
          className={`btn btn-sm ${
            tab === "tomorrow" ? "btn-primary" : "btn-outline-primary"
          }`}
        >
          Tomorrow's Roster{tomorrowDateStr && ` (${tomorrowDateStr})`}
        </button>
      </div>
      <RosterTable entries={tab === "today" ? (todayBlock ? todayBlock.names : []) : (tomorrowBlock ? tomorrowBlock.names : [])} />
    </div>
  );
}

function DataView({ data, loading, error }) {
  const [tab, setTab] = useState(0);
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div>No data yet.</div>;
  // Get the last updated timestamp from any site
  const lastUpdated = data.no5?.timestamp || data.ginza?.timestamp || data.ginza479?.timestamp || null;
  const sites = [
    { label: "Marrickville", content: <No5Roster site={data.no5} lastUpdated={lastUpdated} /> },
    { label: "Cleveland St", content: <GinzaRoster site={data.ginza} lastUpdated={lastUpdated} /> },
    {
      label: "Elizabeth St",
      content: data.ginza479 ? <Ginza479Roster site={data.ginza479} lastUpdated={lastUpdated} /> : null,
    },
  ].filter((site) => site.content);
  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-3">
        {sites.map((site, idx) => (
          <li className="nav-item" key={site.label}>
            <button
              className={`nav-link${tab === idx ? " active" : ""}`}
              onClick={() => setTab(idx)}
              style={{ cursor: "pointer" }}
            >
              {site.label}
            </button>
          </li>
        ))}
      </ul>
      <div>{sites[tab].content}</div>
    </div>
  );
}

export default DataView;
