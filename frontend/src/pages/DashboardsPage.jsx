import { useEffect, useState } from "react";
import { ChartPanel } from "../components/ChartPanel.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const KPICard = ({ value, label, icon, accent, index = 0 }) => (
  <div
    className="kpi-card"
    style={{
      background: "#1E1F2E",
      border: "1px solid #2A2C3E",
      borderRadius: "12px",
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      animationDelay: `${index * 80}ms`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{
          fontSize: "11px", fontWeight: 600, color: "#6B7280",
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: "10px", fontFamily: "'DM Sans', sans-serif",
        }}>
          {label}
        </p>
        <p style={{
          fontSize: "26px", fontWeight: 700, color: "#F1F2F8",
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1,
        }}>
          {value}
        </p>
      </div>
      <div style={{
        width: 38, height: 38, borderRadius: "10px",
        background: `${accent}22`,
        border: `1px solid ${accent}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "17px", flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "2px", background: `linear-gradient(90deg, ${accent}, transparent)`,
    }} />
    <div style={{
      position: "absolute", bottom: 0, right: 0,
      width: 90, height: 90,
      background: `radial-gradient(circle at 100% 100%, ${accent}18 0%, transparent 65%)`,
      pointerEvents: "none",
    }} />
  </div>
);

const SectionLabel = ({ title, subtitle }) => (
  <div style={{ marginBottom: "14px" }}>
    <h3 style={{
      fontSize: "11px", fontWeight: 700, color: "#7C6FCD",
      textTransform: "uppercase", letterSpacing: "0.1em",
      fontFamily: "'DM Sans', sans-serif", margin: 0,
    }}>
      {title}
    </h3>
    {subtitle && (
      <p style={{ fontSize: "12px", color: "#4B5563", marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
        {subtitle}
      </p>
    )}
  </div>
);

export function DashboardsPage() {
  const [summary, setSummary] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const summaryRes = await fetch(`${API_BASE}/dashboard/summary`);
      if (!summaryRes.ok) throw new Error("Failed to fetch summary");
      setSummary(await summaryRes.json());

      const revenueRes = await fetch(`${API_BASE}/dashboard/revenue-by-user`);
      if (!revenueRes.ok) throw new Error("Failed to fetch revenue chart");
      setRevenueChart(await revenueRes.json());

      const widgetsRes = await fetch(`${API_BASE}/dashboard/widgets`);
      if (!widgetsRes.ok) throw new Error("Failed to fetch widgets");
      setWidgets(await widgetsRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteWidget = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete widget");
      setWidgets(widgets.filter(w => w.id !== id));
    } catch (err) {
      alert("Error deleting widget: " + err.message);
    }
  };

  if (loading) return (
    <div style={pageStyle}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-pulse" style={{ height: 100, borderRadius: 12, animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
      <div className="skeleton-pulse" style={{ height: 280, borderRadius: 12, marginTop: 24 }} />
    </div>
  );

  if (error) return (
    <div style={pageStyle}>
      <div style={{
        background: "#2D1B1B", border: "1px solid #7F1D1D", borderRadius: 10,
        padding: "14px 18px", color: "#FCA5A5", fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        ⚠ {error}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .kpi-card { animation: fadeUp 0.4s ease both; }
        .widget-card { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .skeleton-pulse {
          background: linear-gradient(90deg, #1E1F2E 25%, #252739 50%, #1E1F2E 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .chart-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .chart-card:hover {
          border-color: #3A3C52 !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3) !important;
        }

        .delete-btn { opacity: 0; transition: opacity 0.2s; }
        .widget-card:hover .delete-btn { opacity: 1; }

        .refresh-btn { transition: background 0.2s; }
        .refresh-btn:hover { background: #6D5FC7 !important; }
      `}</style>

      <div style={pageStyle}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "28px", paddingBottom: "18px",
          borderBottom: "1px solid #2A2C3E",
        }}>
          <div>
            <p style={{
              fontSize: "10px", fontWeight: 700, color: "#7C6FCD",
              textTransform: "uppercase", letterSpacing: "0.12em",
              fontFamily: "'DM Sans', sans-serif", margin: "0 0 4px",
            }}>
              Insight Analytics
            </p>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
              Dashboard
            </h2>
          </div>
          <button
            className="refresh-btn"
            onClick={fetchDashboardData}
            style={{
              background: "#7C6FCD", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 16px",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* KPI Cards */}
        {summary && (
          <div style={{ marginBottom: "32px" }}>
            <SectionLabel title="Key Metrics" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <KPICard index={0} value={summary.total_users.toLocaleString()} label="Total Users" icon="👤" accent="#7C6FCD" />
              <KPICard index={1} value={summary.total_orders.toLocaleString()} label="Total Orders" icon="📦" accent="#34D399" />
              <KPICard index={2} value={`$${summary.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} label="Total Revenue" icon="💰" accent="#60A5FA" />
              <KPICard index={3} value={`$${summary.avg_order_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} label="Avg Order Value" icon="📊" accent="#F472B6" />
            </div>
          </div>
        )}

        <div style={{ height: 1, background: "#2A2C3E", marginBottom: 28 }} />

        {/* Revenue Chart */}
        {revenueChart && (
          <div style={{ marginBottom: "32px" }}>
            <SectionLabel title="Revenue by User" subtitle="Aggregated order totals per customer" />
            <div className="chart-card" style={chartCardStyle}>
              <ChartPanel chart={revenueChart.chart} />
            </div>
          </div>
        )}

        {/* Saved Widgets */}
        {widgets.length > 0 && (
          <>
            <div style={{ height: 1, background: "#2A2C3E", marginBottom: 28 }} />
            <SectionLabel
              title="Saved Widgets"
              subtitle={`${widgets.length} saved visualization${widgets.length !== 1 ? "s" : ""}`}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
              {widgets.map((widget, i) => (
                <div
                  key={widget.id}
                  className="widget-card chart-card"
                  style={{ ...chartCardStyle, animationDelay: `${i * 60}ms` }}
                >
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #2A2C3E",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 14, background: "#7C6FCD", borderRadius: 2 }} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#E2E3EF", fontFamily: "'DM Sans', sans-serif" }}>
                        {widget.title}
                      </span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => deleteWidget(widget.id)}
                      style={{
                        background: "#2D1B1B", border: "1px solid #7F1D1D",
                        color: "#FCA5A5", borderRadius: 6,
                        padding: "3px 10px", fontSize: "11px", fontWeight: 600,
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <ChartPanel chart={widget.chart} />
                  <p style={{ marginTop: 10, fontSize: "10px", color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>
                    Saved {new Date(widget.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {widgets.length === 0 && !loading && (
          <div style={{
            border: "1px dashed #2A2C3E", borderRadius: 12, padding: "36px",
            textAlign: "center", background: "#1A1B2A",
          }}>
            <p style={{ fontSize: "13px", color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>
              No saved widgets yet. Create queries from Ask AI and save them to the dashboard.
            </p>
          </div>
        )}

      </div>
    </>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const pageStyle = {
  padding: "28px 32px",
  background: "#13141F",
  minHeight: "100vh",
  fontFamily: "'DM Sans', sans-serif",
};

const chartCardStyle = {
  background: "#1E1F2E",
  border: "1px solid #2A2C3E",
  borderRadius: "12px",
  padding: "20px 24px",
};