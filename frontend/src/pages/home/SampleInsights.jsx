import { sampleInsights } from "./homeContent.js";

export function SampleInsights() {
  return (
    <section className="home-section" aria-labelledby="home-insights-heading">
      <div className="home-section__head">
        <h2 id="home-insights-heading" className="home-section__title">
          Example outcomes
        </h2>
        <p className="home-section__lead">
          Illustrative insights your team might surface—wording and metrics depend on your data.
        </p>
      </div>
      <div className="home-insights-grid">
        {sampleInsights.map((item) => (
          <article key={item.id} className="home-insight-card">
            <p className="home-insight-card__headline">{item.headline}</p>
            <p className="home-insight-card__detail">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
