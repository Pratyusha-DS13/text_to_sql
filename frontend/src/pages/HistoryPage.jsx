import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/history`)
      .then(res => res.json())
      .then(setHistory)
      .catch(console.error);
  }, []);

  const handleRunAgain = (question) => {
    navigate(`/ask?q=${encodeURIComponent(question)}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this history item?")) return;
    try {
      await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "28px 32px", background: "#13141F", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #2A2C3E" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#7C6FCD", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>
          Insight Analytics
        </p>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F2F8", margin: "0 0 4px" }}>
          Query History
        </h2>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          View and rerun your previous queries.
        </p>
      </div>

      {history.length === 0 ? (
        <div style={{ background: "#1E1F2E", border: "1px dashed #2A2C3E", borderRadius: "12px", padding: "36px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#4B5563", margin: 0 }}>No history stored yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.map(item => (
            <div
              key={item.id}
              style={{
                background: "#1E1F2E",
                border: "1px solid #2A2C3E",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3A3C52"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#2A2C3E"}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "14px", fontWeight: 500, color: "#E2E3EF",
                  margin: "0 0 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {item.question}
                </p>
                <p style={{ fontSize: "11px", color: "#4B5563", margin: 0 }}>
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={() => handleRunAgain(item.question)}
                  style={{
                    padding: "6px 14px", borderRadius: "7px",
                    background: "#7C6FCD", color: "#fff",
                    border: "none", fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#6D5FC7"}
                  onMouseLeave={e => e.currentTarget.style.background = "#7C6FCD"}
                >
                  Run Again
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: "6px 14px", borderRadius: "7px",
                    background: "transparent", color: "#6B7280",
                    border: "1px solid #2A2C3E", fontSize: "12px", fontWeight: 500,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#7F1D1D"; e.currentTarget.style.color = "#FCA5A5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2C3E"; e.currentTarget.style.color = "#6B7280"; }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}