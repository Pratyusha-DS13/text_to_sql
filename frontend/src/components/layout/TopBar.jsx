export function TopBar() {
  return (
    <header className="topbar">
      <h1 className="topbar__title">Insight Analytics</h1>
      <div className="topbar__meta">
        <span className="status-pill">
          <span className="status-dot" aria-hidden="true" />
          API Ready
        </span>
      </div>
    </header>
  );
}
