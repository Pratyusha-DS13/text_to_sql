import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function buildSeries(chart) {
  if (!chart?.x || !chart?.y || !chart.x_label || !chart.y_label) return [];
  return chart.x.map((x, i) => ({
    [chart.x_label]: x,
    [chart.y_label]: chart.y[i],
  }));
}

export function ChartPanel({ chart }) {
  if (!chart || chart.type === "none") {
    return <p className="chart-empty">No chart for this result.</p>;
  }

  if (chart.type === "kpi") {
    return (
      <div className="chart-kpi">
        <span className="chart-kpi-value">{String(chart.value)}</span>
        <span className="chart-kpi-label">{chart.label}</span>
      </div>
    );
  }

  if (chart.type === "table") {
    const cols = chart.columns ?? [];
    const rows = chart.rows ?? [];
    return (
      <div className="chart-table-wrap">
        <table className="chart-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c}>{row[c] != null ? String(row[c]) : ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const data = buildSeries(chart);
  if (data.length === 0) {
    return <p className="chart-empty">Chart data incomplete.</p>;
  }

  const xKey = chart.x_label;
  const yKey = chart.y_label;

  const tooltipStyle = {
    backgroundColor: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: "8px",
    fontSize: "12px",
    boxShadow: "var(--shadow-md)",
  };

  if (chart.type === "line") {
    return (
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === "bar") {
    return (
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={yKey} fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return <p className="chart-empty">Unknown chart type: {chart.type}</p>;
}
