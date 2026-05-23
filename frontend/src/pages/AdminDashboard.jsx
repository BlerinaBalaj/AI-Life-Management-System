import { useState, useEffect } from "react";
import { api } from "../api/client.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.getAdminUsers();
      const users = res.data || [];
      const total = users.length;
      const active = users.filter(u => u.enabled !== false).length;
      const suspended = total - active;
      setStats({ total, active, suspended });
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System Analytics & Overview</p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-light)", fontSize: "0.875rem", textTransform: "uppercase" }}>Total Users</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem" }}>{stats.total}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-light)", fontSize: "0.875rem", textTransform: "uppercase" }}>Active Users</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem", color: "#166534" }}>{stats.active}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-light)", fontSize: "0.875rem", textTransform: "uppercase" }}>Suspended Users</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem", color: "#dc2626" }}>{stats.suspended}</p>
        </div>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <h2 className="card-title">Platform Engagement (Mock Data)</h2>
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Daily Planner Usage</span>
              <span style={{ color: "var(--text-light)" }}>85%</span>
            </div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: "85%", height: "100%", backgroundColor: "var(--primary)" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>AI Assistant Interactions</span>
              <span style={{ color: "var(--text-light)" }}>62%</span>
            </div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: "62%", height: "100%", backgroundColor: "#8b5cf6" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Fitness & Nutrition Tracking</span>
              <span style={{ color: "var(--text-light)" }}>45%</span>
            </div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: "45%", height: "100%", backgroundColor: "#10b981" }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
