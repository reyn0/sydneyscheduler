import React, { useState } from "react";

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
  return (
    <table className="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Start</th>
          <th>Finish</th>
        </tr>
      </thead>
      <tbody>
        {entries && entries.length > 0 ? (
          entries.map((entry, idx) => {
            const { code, name, start, finish } = parseNameTime(entry);
            return (
              <tr key={idx}>
                <td>{code}</td>
                <td>{name}</td>
                <td>{start}</td>
                <td>{finish}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={4} className="text-center">
              No data
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function No5Roster({ site, lastUpdated }) {
  const [tab, setTab] = useState("today");
  const { today, tomorrow, title } = site;
  // Determine the date string from lastUpdated
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
      <RosterTable entries={tab === "today" ? today : tomorrow} />
    </div>
  );
}

function GinzaRoster({ site, lastUpdated }) {
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
