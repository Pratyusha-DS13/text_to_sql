import { Link } from "react-router-dom";

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero__inner">
        <p className="home-hero__eyebrow">Insight Analytics</p>
        <h1 className="home-hero__title">AI-Powered Analytics for Business Decisions</h1>
        <p className="home-hero__subtitle">
          Ask questions in plain English and get instant insights, SQL, and visualizations.
        </p>
        <div className="home-hero__actions">
          <Link className="home-btn home-btn--primary" to="/ask">
            Ask a Question
          </Link>
          <Link className="home-btn home-btn--secondary" to="/dashboards">
            View Dashboards
          </Link>
        </div>
      </div>
    </section>
  );
}
