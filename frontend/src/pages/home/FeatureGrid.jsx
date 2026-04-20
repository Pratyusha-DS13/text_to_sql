import { features } from "./homeContent.js";
import { FeatureIcon } from "./FeatureIcons.jsx";

export function FeatureGrid() {
  return (
    <section className="home-section" aria-labelledby="home-features-heading">
      <div className="home-section__head">
        <h2 id="home-features-heading" className="home-section__title">
          What you can do
        </h2>
        <p className="home-section__lead">
          Everything you need to go from question to decision—without writing SQL.
        </p>
      </div>
      <div className="home-feature-grid">
        {features.map((f, i) => (
          <article key={f.id} className="home-feature-card">
            <div className="home-feature-card__icon-wrap" aria-hidden="true">
              <FeatureIcon index={i} className="home-feature-card__icon" />
            </div>
            <h3 className="home-feature-card__title">{f.title}</h3>
            <p className="home-feature-card__desc">{f.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
