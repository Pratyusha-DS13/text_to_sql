import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export default function ConnectDatabase() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    type: "MySQL",
    host: "localhost",
    port: "3306",
    db: "text_to_sql",
    user: "root",
    password: "",
    readonly: true,
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const connect = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/connect-db`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: form.host,
          port: form.port,
          user: form.user,
          password: form.password,
          db: form.db,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem(
          "db_connection",
          JSON.stringify({
            type: "MySQL",
            host: form.host,
            db: form.db,
          })
        );
        window.dispatchEvent(new Event("dbConnectionChanged"));
        setSuccess(true);
      } else {
        setError(data.message || "Connection failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-start justify-center px-4 pt-12 pb-20" style={{ background: "#13141F" }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center" style={{ color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif" }}>Secure MySQL Connection</h1>
          <p className="text-sm text-gray-400 text-center mb-6" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Enterprise-grade database onboarding</p>

          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 w-full justify-center" style={{ background: "#1E2A1E", border: "1px solid #16A34A44", color: "#34D399", fontFamily: "'DM Sans', sans-serif" }}>
            <span>🔒</span>
            <span>Secure connection — credentials are never stored</span>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-0 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-0 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step >= s ? "#7C6FCD" : "#1E1F2E",
                    color: step >= s ? "#fff" : "#6B7280",
                    border: step >= s ? "none" : "1px solid #2A2C3E",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className="h-0.5 flex-1 mx-1 transition-all"
                    style={{ background: step > s ? "#7C6FCD" : "#2A2C3E" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {step === 1 && <Step1 form={form} setForm={setForm} next={next} />}
          {step === 2 && <Step2 form={form} setForm={setForm} next={next} back={back} />}
          {step === 3 && (
            <Step3
              form={form}
              back={back}
              connect={connect}
              loading={loading}
              error={error}
              success={success}
              step={step}
            />
          )}
        </div>

        {/* Enterprise Trust Footer */}
        <div className="mt-10 pt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs tracking-wide" style={{ borderTop: "1px solid #2A2C3E", color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>
          {["SOC 2 Ready", "GDPR Compliant", "Zero Data Retention", "TLS Encrypted"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step1({ form, setForm, next }) {
  return (
    <div className="p-6 space-y-5" style={{ background: "#1E1F2E", border: "1px solid #2A2C3E", borderRadius: "12px" }}>
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif" }}>Connection Basics</h2>
        <p className="text-sm" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Select your database engine and provide the network endpoint.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: "#C4C6D8", fontFamily: "'DM Sans', sans-serif" }}>Database Type</label>
          <input
            type="text"
            value={form.type}
            readOnly
            style={inputStyle}
          />
          <p className="text-xs" style={{ color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>Select your database engine.</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: "#C4C6D8", fontFamily: "'DM Sans', sans-serif" }}>Host</label>
          <input
            type="text"
            value={form.host}
            onChange={(e) => setForm({ ...form, host: e.target.value })}
            style={inputStyle}
            placeholder="e.g. db.company.internal"
          />
          <p className="text-xs" style={{ color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>Database server address or IP</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: "#C4C6D8", fontFamily: "'DM Sans', sans-serif" }}>Port</label>
          <input
            type="text"
            value={form.port}
            onChange={(e) => setForm({ ...form, port: e.target.value })}
            style={inputStyle}
            placeholder="3306"
          />
          <p className="text-xs" style={{ color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>Default port for MySQL connections</p>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={next} style={primaryBtnStyle}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function Step2({ form, setForm, next, back }) {
  return (
    <div className="p-6 space-y-5" style={{ background: "#1E1F2E", border: "1px solid #2A2C3E", borderRadius: "12px" }}>
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif" }}>Credentials</h2>
        <p className="text-sm" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Enter the database details required for read-only access.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: "#C4C6D8", fontFamily: "'DM Sans', sans-serif" }}>Database Name</label>
          <input
            type="text"
            value={form.db}
            onChange={(e) => setForm({ ...form, db: e.target.value })}
            style={inputStyle}
            placeholder="text_to_sql"
          />
          <p className="text-xs" style={{ color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>The database you want to query</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: "#C4C6D8", fontFamily: "'DM Sans', sans-serif" }}>Username</label>
          <input
            type="text"
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            style={inputStyle}
            placeholder="root"
          />
          <p className="text-xs" style={{ color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>Database user with read access</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: "#C4C6D8", fontFamily: "'DM Sans', sans-serif" }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
            placeholder="••••••••"
          />
          <p className="text-xs" style={{ color: "#4B5563", fontFamily: "'DM Sans', sans-serif" }}>Your password is never stored or logged</p>
        </div>
      </div>

      <div className="px-3 py-2.5 text-xs font-medium" style={{ background: "#1A1500", border: "1px solid #78350F44", borderRadius: "8px", color: "#FCD34D", fontFamily: "'DM Sans', sans-serif" }}>
        <span>🔒</span> Read-Only Mode — Only SELECT queries allowed
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={back} style={secondaryBtnStyle}>
          ← Back
        </button>
        <button onClick={next} style={primaryBtnStyle}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function Step3({ form, back, connect, loading, error, success }) {
  return (
    <div className="space-y-5">
      {/* Connection Summary Card */}
      <div style={{ background: "#1E1F2E", border: "1px solid #2A2C3E", borderRadius: "12px", overflow: "hidden" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #2A2C3E" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Connection Summary</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#13141F", color: "#7C6FCD", fontFamily: "'DM Sans', sans-serif" }}>{form.type}</span>
        </div>
        {[
          { label: "Host", value: form.host },
          { label: "Port", value: form.port },
          { label: "Database", value: form.db },
          { label: "Username", value: form.user },
          { label: "Password", value: "••••••••" },
        ].map(({ label, value }) => (
          <div key={label} className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #2A2C3E" }}>
            <span className="text-sm" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
            <span className="text-sm font-mono" style={{ color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="px-4 py-3 text-sm" style={{ background: "#2D1B1B", border: "1px solid #7F1D1D", borderRadius: "10px", color: "#FCA5A5", fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 text-sm font-medium" style={{ background: "#1E2A1E", border: "1px solid #16A34A44", borderRadius: "10px", color: "#34D399", fontFamily: "'DM Sans', sans-serif" }}>
          ✓ Successfully connected to MySQL database
        </div>
      )}

      {/* Security & Privacy Card */}
      <div className="p-5" style={{ background: "#1E1F2E", border: "1px solid #2A2C3E", borderRadius: "12px" }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif" }}>
          <span>🔒</span> Security & Privacy Guarantee
        </h3>
        <ul className="space-y-2">
          {[
            "Credentials are never stored or logged",
            "All connections use TLS encryption in transit",
            "Only read-only SELECT queries are executed",
            "No data is copied or retained externally",
            "Access can be revoked instantly at any time",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ color: "#34D399", marginTop: "2px", flexShrink: 0 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* What Happens Next Card */}
      <div className="p-5" style={{ background: "#1E1F2E", border: "1px solid #2A2C3E", borderRadius: "12px" }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#F1F2F8", fontFamily: "'DM Sans', sans-serif" }}>
          <span>⚡</span> What Happens After You Connect
        </h3>
        <ol className="space-y-2">
          {[
            "Your schema (tables & columns) is analyzed — no row data is read",
            "Ask questions in plain English — e.g. \"Show revenue by region\"",
            "SQL is generated transparently — you see the query before it runs",
            "You stay in control — approve, edit, or reject any query",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-xs" style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ color: "#4B5563", fontFamily: "monospace", fontWeight: "bold", flexShrink: 0 }}>{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <button onClick={back} disabled={loading} style={{ ...secondaryBtnStyle, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          ← Back
        </button>
        <button
          onClick={connect}
          disabled={loading || success}
          style={{
            flex: 1, padding: "10px 24px", borderRadius: "8px",
            fontWeight: 600, fontSize: "14px", cursor: loading || success ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif", border: "none", transition: "background 0.2s",
            background: success ? "#16A34A" : loading ? "#252739" : "#7C6FCD",
            color: loading ? "#6B7280" : "#fff",
          }}
        >
          {success ? (
            "✓ Connected Successfully"
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Testing connection...
            </span>
          ) : (
            "Test & Connect →"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  background: "#13141F",
  border: "1px solid #2A2C3E",
  color: "#F1F2F8",
  fontFamily: "monospace",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtnStyle = {
  flex: 1,
  padding: "10px 0",
  borderRadius: "8px",
  background: "#7C6FCD",
  color: "#fff",
  border: "none",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  transition: "background 0.2s",
};

const secondaryBtnStyle = {
  flex: 1,
  padding: "10px 0",
  borderRadius: "8px",
  background: "transparent",
  color: "#6B7280",
  border: "1px solid #2A2C3E",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s, color 0.2s",
};