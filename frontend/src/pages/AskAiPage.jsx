import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ChartPanel } from "../components/ChartPanel.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function AskAiPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [editingSql, setEditingSql] = useState(false);
  const [editedSql, setEditedSql] = useState("");
  const [explainingSql, setExplainingSql] = useState(false);
  const [explanation, setExplanation] = useState("");

  const parseJsonResponse = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text || "Unable to parse response body." };
    }
  };

  const fetchInsight = async (result) => {
    setInsightLoading(true);
    try {
      console.log("Fetching insight for:", { query, sql: result.sql, dataLength: result.data.length });
      
      // Add timeout so it doesn't hang forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`${API_BASE}/generate-insight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query,
          sql: result.sql,
          data: result.data.slice(0, 20), // Only send first 20 rows for faster processing
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Insight response status:", res.status);
      
      const data = await parseJsonResponse(res);
      console.log("Insight response JSON:", data);

      if (!res.ok) {
        console.error("Insight API error:", { status: res.status, data });
        setInsight(data?.insight || "Unable to generate insight. Check server logs.");
        return;
      }

      setInsight(data?.insight || "Unable to generate insight.");
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn("Insight generation timed out");
        setInsight("Insight generation took too long. Showing fallback insight.");
      } else {
        console.error("Insight fetch error:", err);
        setInsight(`Error: ${err.message}`);
      }
    } finally {
      setInsightLoading(false);
    }
  };

  const explainQuery = async () => {
    if (!response?.sql) return;
    
    setExplainingSql(true);
    try {
      console.log("Explaining query...");
      const res = await fetch(`${API_BASE}/explain-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: response.sql,
        }),
      });

      console.log("Explain response status:", res.status);

      const data = await parseJsonResponse(res);
      console.log("Explain response JSON:", data);

      if (res.ok) {
        setExplanation(data?.explanation || "No explanation available.");
      } else {
        console.error("Explain query error:", { status: res.status, data });
        setExplanation("SQL Query Explanation:\n\n" + response.sql);
      }
    } catch (err) {
      console.error("Explain query fetch error:", err);
      setExplanation(`Error: ${err.message}`);
    } finally {
      setExplainingSql(false);
    }
  };

  const saveToDashboard = async () => {
    if (!response) return;

    const title = prompt("Enter a title for this dashboard widget:");
    if (!title?.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/dashboard/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          sql: response.sql,
          chart: response.chart,
        }),
      });

      if (!res.ok) throw new Error("Failed to save to dashboard");

      alert("Widget saved to dashboard successfully!");
    } catch (err) {
      alert("Error saving to dashboard: " + err.message);
    }
  };

  const handleSqlEdit = () => {
    setEditingSql(!editingSql);
    if (!editingSql) {
      setEditedSql(response.sql);
    }
  };

  const handleApplyEditedSql = async () => {
    if (!editedSql.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setEditingSql(false);

    try {
      console.log("Executing edited SQL...");
      // Execute the edited SQL directly
      const res = await fetch(`${API_BASE}/query/execute-sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: editedSql }),
      });

      console.log("Execute SQL response status:", res.status);

      let payload;
      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        payload = await parseJsonResponse(res);
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        payload = { detail: text };
      }

      if (!res.ok) {
        const msg =
          typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail ?? payload);
        console.error("Error response:", msg);
        setError(msg || `Request failed (${res.status})`);
        return;
      }

      console.log("Payload received:", payload);
      setResponse(payload);
      await fetchInsight(payload);
    } catch (err) {
      console.error("Execute SQL error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Network error — is the API running on port 8000?",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setInsight("");
    setExplanation("");
    setLoadingStep("Generating SQL...");

    try {
      // Simulate step progression
      const steps = [
        "Generating SQL...",
        "Running query...",
        "Analyzing results...",
      ];

      for (const step of steps) {
        setLoadingStep(step);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const res = await fetch(`${API_BASE}/query/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.log("Query response status:", res.status);

      let payload;
      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        payload = await parseJsonResponse(res);
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        payload = { detail: text };
      }

      if (!res.ok) {
        const msg =
          typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail ?? payload);
        console.error("Error response:", msg);
        setError(msg || `Request failed (${res.status})`);
        return;
      }

      console.log("Query payload received:", payload);
      setResponse(payload);
      
      // Generate insight in background (non-blocking) so UI shows results immediately
      console.log("Generating insight in background...");
      fetchInsight(payload).catch(err => console.error("Background insight error:", err));
    } catch (err) {
      console.error("Query fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Network error — is the API running on port 8000?",
      );
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Ask AI</h2>
        <p className="page__description">
          Describe what you want to know — we generate SQL, run it, and visualize the result.
        </p>
      </div>

      <section className="card query-card" aria-labelledby="query-heading">
        <div className="card-header">
          <div>
            <p id="query-heading" className="card-title">
              New question
            </p>
            <p className="card-subtitle">Ask in plain English — we generate SQL and visuals</p>
          </div>
        </div>
        <div className="card-body">
          <form
            className="query-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="query-input-wrap">
              <label className="query-label" htmlFor="nl-query">
                Your question
              </label>
              <input
                id="nl-query"
                className="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g. "Total order amount by user name"'
                autoComplete="off"
              />
            </div>
            <div className="query-actions">
              <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
                {loading ? `${loadingStep || "Running…"}` : "Run analysis"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {loading && (
        <div className="loading-row" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>{loadingStep || "Executing query and building visualization…"}</span>
        </div>
      )}

      {error && (
        <div className="alert alert--error" role="alert">
          <strong>Error.</strong> {error}
        </div>
      )}

      {response && !loading && (
        <div className="results space-y-6">
          {/* SECTION 1: Insight Summary */}
          <section className="card" aria-labelledby="insight-heading">
            <div className="card-header">
              <p id="insight-heading" className="card-title">
                💡 Insight
              </p>
            </div>
            <div className="card-body">
              {insightLoading ? (
                <p className="text-sm text-gray-400 italic">Analyzing data and generating insights...</p>
              ) : (
                <p className="text-sm text-gray-300">
                  {insight}
                </p>
              )}
            </div>
          </section>

          {/* SECTION 2: Chart */}
          <section className="card chart-card" aria-labelledby="chart-heading">
            <div className="card-header">
              <div>
                <p id="chart-heading" className="card-title">
                  Visualization
                </p>
                <p className="card-subtitle">Auto-selected chart from your data</p>
              </div>
            </div>
            <div className="card-body card-body--flush card-body--chart">
              <ChartPanel chart={response.chart} />
            </div>
          </section>

          {/* SECTION 3: Generated SQL */}
          <section className="card" aria-labelledby="sql-heading">
            <div className="card-header">
              <div>
                <p id="sql-heading" className="card-title">
                  Generated SQL
                </p>
                <p className="card-subtitle">Read-only SELECT</p>
              </div>
            </div>
            <div className="card-body card-body--flush">
              {editingSql ? (
                <div className="p-4 space-y-3">
                  <textarea
                    value={editedSql}
                    onChange={(e) => setEditedSql(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-xs font-mono text-gray-300"
                    rows={8}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyEditedSql}
                      className="action-btn bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                    >
                      Apply & Execute
                    </button>
                    <button
                      onClick={() => setEditingSql(false)}
                      className="action-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="sql-block">{response.sql}</pre>
              )}
            </div>
          </section>

          {/* SQL Explanation Modal/Card */}
          {explanation && (
            <section className="card" aria-labelledby="explain-heading">
              <div className="card-header">
                <div>
                  <p id="explain-heading" className="card-title">
                    Query Explanation
                  </p>
                </div>
                <button
                  onClick={() => setExplanation("")}
                  className="text-xs text-gray-500 hover:text-gray-400"
                >
                  ✕ Close
                </button>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {explanation}
                </p>
              </div>
            </section>
          )}

          {/* SECTION 4: Result Table */}
          <section className="card" aria-labelledby="table-heading">
            <div className="card-header">
              <div>
                <p id="table-heading" className="card-title">
                  Result Table
                </p>
                <p className="card-subtitle">{response.data?.length ?? 0} rows</p>
              </div>
            </div>
            <div className="card-body card-body--flush">
              {response.data && response.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="result-table">
                    <thead>
                      <tr>
                        {Object.keys(response.data[0]).map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {response.data.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No results returned</p>
              )}
            </div>
          </section>

          {/* SECTION 5: Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            <button
              className="action-btn"
              onClick={explainQuery}
              disabled={explainingSql}
            >
              {explainingSql ? "Explaining..." : "Explain Query"}
            </button>
            <button
              className="action-btn"
              onClick={handleSqlEdit}
            >
              {editingSql ? "Cancel Edit" : "Edit SQL"}
            </button>
            <button className="action-btn" onClick={() => handleSubmit()}>
              Re-run
            </button>
            <button
              className="action-btn"
              onClick={saveToDashboard}
              disabled={!response}
            >
              Save to Dashboard
            </button>
          </div>
        </div>
      )}

      {!response && !loading && !error && (
        <p className="empty-state">
          Run a question above to see SQL, tabular results, and a chart in one flow.
        </p>
      )}
    </div>
  );
}
