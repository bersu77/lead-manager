"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MARQUEE_ITEMS = [
  "Track Leads", "Manage Pipeline", "Close Deals", "Grow Revenue",
  "Stay Organized", "Boost Sales", "Email Notifications", "Simple & Fast",
  "Track Leads", "Manage Pipeline", "Close Deals", "Grow Revenue",
  "Stay Organized", "Boost Sales", "Email Notifications", "Simple & Fast",
];

function getStatusClass(status) {
  switch (status) {
    case "New": return "st-new";
    case "Engaged": return "st-eng";
    case "Proposal Sent": return "st-prop";
    case "Closed-Won": return "st-won";
    case "Closed-Lost": return "st-lost";
    default: return "st-new";
  }
}

export default function Home() {
  const [page, setPage] = useState("landing");
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState("");
  const [toast, setToast] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [leads, setLeads] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("New");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chartTab, setChartTab] = useState("all");
  const [tableTab, setTableTab] = useState("all");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    const savedName = localStorage.getItem("userName");
    if (saved) {
      setToken(saved);
      setUserName(savedName || "");
    }
  }, []);

  const doLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken(null);
    setUserName("");
    setPage("landing");
  }, []);

  const fetchLeads = useCallback(async (tkn) => {
    if (!tkn) return;
    try {
      const res = await fetch(`${API_URL}/leads`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tkn}` },
      });
      if (res.status === 401) { doLogout(); return; }
      const data = await res.json();
      setLeads(data);
    } catch { /* ignore */ }
  }, [doLogout]);

  useEffect(() => {
    if (token && (page === "list" || page === "form" || page === "dashboard")) {
      fetchLeads(token);
    }
  }, [page, token, fetchLeads]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const body = authMode === "login"
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error); setAuthLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      setToken(data.token);
      setUserName(data.user.name);
      setAuthEmail(""); setAuthPassword(""); setAuthName("");
      setAuthLoading(false);
      showToast(authMode === "register" ? "Account created successfully!" : "Logged in successfully!");
      setPage("form");
    } catch { setAuthError("Something went wrong"); setAuthLoading(false); }
  };

  const logout = () => { doLogout(); showToast("Logged out successfully!"); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, status }),
      });
      if (res.status === 401) { doLogout(); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setName(""); setEmail(""); setStatus("New");
      setLoading(false); setSuccess(true);
      fetchLeads(token);
      setTimeout(() => setSuccess(false), 3000);
    } catch { setError("Failed to add lead"); setLoading(false); }
  };

  const toastEl = toast ? <div className="toast">{toast}</div> : null;

  // ============ LANDING ============
  if (page === "landing") {
    return (
      <div className="landing">
        {toastEl}
        <div className="landing-nav">
          <div className="logo-box">LM</div>
          <button className="landing-nav-btn" onClick={() => { if (token) setPage("form"); else { setPage("auth"); setAuthMode("login"); } }}>
            {token ? "Dashboard" : "Sign In"}
          </button>
        </div>
        <div className="landing-hero">
          <div className="landing-left">
            <div className="badge">Test Project</div>
            <h1 className="hero-title"><span className="ht-solid">Lead</span><span className="ht-outline">Manager</span></h1>
            <p className="hero-sub">Track leads. Close deals.<br/>Grow your pipeline.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => { if (token) setPage("form"); else { setPage("auth"); setAuthMode("register"); } }}>Get Started</button>
              <button className="btn-ghost" onClick={() => { if (token) setPage("list"); else { setPage("auth"); setAuthMode("login"); } }}>View Leads</button>
            </div>
          </div>
          <div className="landing-right">
            <div className="float-card fc1"><span className="fc-dot fc-green"></span>12 New Leads</div>
            <div className="float-card fc2"><span className="fc-dot fc-orange"></span>5 Engaged</div>
            <div className="float-card fc3"><span className="fc-dot fc-red"></span>3 Proposals Sent</div>
            <div className="float-card fc4"><span className="fc-dot fc-green"></span>8 Closed Won</div>
            <div className="float-num">28</div>
            <div className="float-label">Total Leads</div>
          </div>
        </div>
        <div className="landing-marquee">
          <div className="marquee">{MARQUEE_ITEMS.map((item, i) => <span key={i}>&#x2022; {item}</span>)}</div>
        </div>
      </div>
    );
  }

  // ============ AUTH ============
  if (page === "auth") {
    return (
      <div className="auth-page">
        {toastEl}
        <button className="back-link" onClick={() => setPage("landing")}>&larr; Back</button>
        <div className="auth-card">
          <h1 className="auth-title">Lead Manager</h1>
          <p className="auth-sub">{authMode === "login" ? "Sign in to your account" : "Create a new account"}</p>
          <div className="auth-tabs">
            <button className={`at ${authMode === "login" ? "at-active" : ""}`} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Login</button>
            <button className={`at ${authMode === "register" ? "at-active" : ""}`} onClick={() => { setAuthMode("register"); setAuthError(""); }}>Register</button>
          </div>
          {authError && <div className="err">{authError}</div>}
          <form onSubmit={handleAuth}>
            {authMode === "register" && <div className="fg"><label>Name</label><input type="text" placeholder="John Doe" value={authName} onChange={e => setAuthName(e.target.value)} required/></div>}
            <div className="fg"><label>Email</label><input type="email" placeholder="john@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required/></div>
            <div className="fg"><label>Password</label><input type="password" placeholder="Min 6 characters" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required minLength={6}/></div>
            <button type="submit" className="btn-primary btn-full" disabled={authLoading}>{authLoading ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}</button>
          </form>
          <p className="auth-switch">{authMode === "login" ? "No account? " : "Have an account? "}<button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>{authMode === "login" ? "Register" : "Sign In"}</button></p>
        </div>
      </div>
    );
  }

  // ============ DASHBOARD ============
  const cnt = (s) => leads.filter(l => l.status === s).length;
  const totalNew = cnt("New");
  const totalEng = cnt("Engaged");
  const totalProp = cnt("Proposal Sent");
  const totalWon = cnt("Closed-Won");
  const totalLost = cnt("Closed-Lost");

  const ArrowUp = () => <svg className="trend-icon trend-up" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

  // Filter leads for table tabs
  const filteredLeads = tableTab === "all" ? leads
    : tableTab === "new" ? leads.filter(l => l.status === "New")
    : tableTab === "active" ? leads.filter(l => l.status === "Engaged" || l.status === "Proposal Sent")
    : leads.filter(l => l.status === "Closed-Won" || l.status === "Closed-Lost");

  // Simple SVG chart bars from leads by date
  const chartBars = () => {
    const days = {};
    leads.forEach(l => {
      const d = new Date(l.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" });
      days[d] = (days[d] || 0) + 1;
    });
    const entries = Object.entries(days).slice(-12);
    return entries;
  };
  const bars = chartBars();
  const maxBar = bars.length > 0 ? Math.max(...bars.map(b => b[1])) : 1;

  return (
    <div className="dash">
      {toastEl}
      {/* Sidebar */}
      <aside className="sb">
        <div className="sb-head">
          <button className="sb-back" onClick={() => setPage("landing")} title="Back to Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="logo-box">LM</div>
          <span className="sb-title">Lead Manager</span>
        </div>
        <nav className="sb-nav">
          <button className={`sb-item ${page === "form" ? "sb-active" : ""}`} onClick={() => setPage("form")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Lead
          </button>
          <button className={`sb-item ${page === "list" ? "sb-active" : ""}`} onClick={() => setPage("list")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            All Leads
          </button>
          <div className="sb-section">Overview</div>
          <button className={`sb-item ${page === "dashboard" ? "sb-active" : ""}`} onClick={() => setPage("dashboard")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </button>
          <div className="sb-item sb-disabled">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            Analytics
          </div>
          <div className="sb-item sb-disabled">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            Team
          </div>
        </nav>
        <div className="sb-foot">
          <div className="sb-item sb-disabled">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings
          </div>
          <div className="sb-divider"></div>
          <div className="sb-user">
            <div className="sb-avatar">{(userName || "U").charAt(0).toUpperCase()}</div>
            <div className="sb-uinfo">
              <div className="sb-uname">{userName}</div>
              <div className="sb-uemail">Lead Manager</div>
            </div>
          </div>
          <button className="sb-logout" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Header */}
        <div className="main-header">
          <div>
            <h1 className="main-title">{page === "form" ? "Add New Lead" : page === "dashboard" ? "Dashboard" : "All Leads"}</h1>
            <p className="main-sub">{page === "form" ? "Fill in the details to add a new lead" : page === "dashboard" ? `Welcome back, ${userName}` : `Showing ${leads.length} leads in your pipeline`}</p>
          </div>
          <button className="btn-primary" onClick={() => setPage("form")}>+ Add Lead</button>
        </div>

        {/* Stat Cards - shadcn style with trend arrows */}
        <div className="stat-row">
          <div className="stat-card">
            <div className="sc-top"><span className="sc-label">Total Leads</span><span className="sc-trend sc-trend-up"><ArrowUp/> +{leads.length}</span></div>
            <div className="sc-num">{leads.length}</div>
            <p className="sc-trend-text">Trending up this month <ArrowUp/></p>
            <p className="sc-desc">All leads in pipeline</p>
          </div>
          <div className="stat-card">
            <div className="sc-top"><span className="sc-label">New Leads</span><span className="sc-trend sc-trend-up"><ArrowUp/> +{totalNew}</span></div>
            <div className="sc-num">{totalNew}</div>
            <p className="sc-trend-text">Awaiting first contact <ArrowUp/></p>
            <p className="sc-desc">Leads for the last 30 days</p>
          </div>
          <div className="stat-card">
            <div className="sc-top"><span className="sc-label">Active Pipeline</span><span className="sc-trend sc-trend-green"><ArrowUp/> +{totalEng + totalProp}</span></div>
            <div className="sc-num">{totalEng + totalProp}</div>
            <p className="sc-trend-text">Strong engagement <ArrowUp/></p>
            <p className="sc-desc">{totalEng} engaged, {totalProp} proposals</p>
          </div>
          <div className="stat-card">
            <div className="sc-top"><span className="sc-label">Conversion Rate</span><span className="sc-trend sc-trend-up"><ArrowUp/> +{leads.length ? Math.round(totalWon/leads.length*100) : 0}%</span></div>
            <div className="sc-num">{leads.length ? Math.round(totalWon/leads.length*100) : 0}%</div>
            <p className="sc-trend-text">Steady performance <ArrowUp/></p>
            <p className="sc-desc">{totalWon} won / {totalLost} lost</p>
          </div>
        </div>

        {/* Chart area - like shadcn "Total Visitors" */}
        {(page === "dashboard" || page === "list") && (
          <div className="content-card chart-card">
            <div className="chart-header">
              <div>
                <h2 className="chart-title">Lead Activity</h2>
                <p className="chart-sub">Leads added over time</p>
              </div>
              <div className="chart-tabs">
                <button className={`ct ${chartTab === "all" ? "ct-active" : ""}`} onClick={() => setChartTab("all")}>All Time</button>
                <button className={`ct ${chartTab === "30" ? "ct-active" : ""}`} onClick={() => setChartTab("30")}>Last 30 days</button>
                <button className={`ct ${chartTab === "7" ? "ct-active" : ""}`} onClick={() => setChartTab("7")}>Last 7 days</button>
              </div>
            </div>
            <div className="chart-area">
              {bars.length === 0 ? (
                <div className="chart-empty">No data yet</div>
              ) : (
                <div className="bar-chart">
                  {bars.map(([label, count], i) => (
                    <div key={i} className="bar-col">
                      <div className="bar" style={{ height: `${(count / maxBar) * 100}%` }}></div>
                      <span className="bar-label">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table tabs - like shadcn Outline/Past Performance tabs */}
        {page === "list" && (
          <>
            <div className="table-tabs">
              <div className="tt-left">
                <button className={`tt ${tableTab === "all" ? "tt-active" : ""}`} onClick={() => setTableTab("all")}>All Leads <span className="tt-count">{leads.length}</span></button>
                <button className={`tt ${tableTab === "new" ? "tt-active" : ""}`} onClick={() => setTableTab("new")}>New <span className="tt-count">{totalNew}</span></button>
                <button className={`tt ${tableTab === "active" ? "tt-active" : ""}`} onClick={() => setTableTab("active")}>Active <span className="tt-count">{totalEng + totalProp}</span></button>
                <button className={`tt ${tableTab === "closed" ? "tt-active" : ""}`} onClick={() => setTableTab("closed")}>Closed <span className="tt-count">{totalWon + totalLost}</span></button>
              </div>
              <button className="btn-ghost btn-sm" onClick={() => setPage("form")}>+ Add Lead</button>
            </div>
            <div className="content-card">
              {filteredLeads.length === 0 ? (
                <div className="empty">No leads in this category.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th></th><th>Name</th><th>Email</th><th>Status</th><th>Type</th><th>Created</th></tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead, i) => (
                        <tr key={lead._id}>
                          <td className="td-idx">{i + 1}</td>
                          <td className="td-name">{lead.name}</td>
                          <td className="td-email">{lead.email}</td>
                          <td><span className={`status-pill ${getStatusClass(lead.status)}`}>{lead.status}</span></td>
                          <td className="td-type">Lead</td>
                          <td className="td-date">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Dashboard view - chart + recent leads */}
        {page === "dashboard" && (
          <div className="content-card">
            <div className="card-hdr">
              <h2 className="chart-title">Recent Leads</h2>
              <button className="btn-ghost btn-sm" onClick={() => setPage("list")}>View all</button>
            </div>
            {leads.length === 0 ? (
              <div className="empty">No leads yet. Add your first lead!</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Status</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead._id}>
                        <td className="td-name">{lead.name}</td>
                        <td className="td-email">{lead.email}</td>
                        <td><span className={`status-pill ${getStatusClass(lead.status)}`}>{lead.status}</span></td>
                        <td className="td-date">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {page === "form" && (
          <div className="content-card" style={{maxWidth: 580}}>
            {success ? (
              <div className="success-box">
                <div className="success-check">&#10003;</div>
                <h3>Lead Added Successfully!</h3>
                <p>A welcome email notification has been sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="err">{error}</div>}
                <div className="fg"><label>Name</label><input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required/></div>
                <div className="fg"><label>Email</label><input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required/></div>
                <div className="fg"><label>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="New">New</option><option value="Engaged">Engaged</option>
                    <option value="Proposal Sent">Proposal Sent</option><option value="Closed-Won">Closed-Won</option>
                    <option value="Closed-Lost">Closed-Lost</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary btn-full" disabled={loading}>{loading ? "Adding..." : "Submit Lead"}</button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
