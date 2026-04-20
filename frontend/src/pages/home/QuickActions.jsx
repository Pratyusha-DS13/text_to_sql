import { useNavigate } from "react-router-dom";

import { quickActions } from "./homeContent.js";

export function QuickActions() {
  const navigate = useNavigate();

  const goToAsk = (query) => {
    const params = new URLSearchParams({ q: query });
    navigate(`/ask?${params.toString()}`);
  };

  return (
    <section className="home-section" aria-labelledby="home-quick-heading">
      <div className="home-section__head">
        <h2 id="home-quick-heading" className="home-section__title">
          Quick actions
        </h2>
        <p className="home-section__lead">Start from a common business question—we open Ask AI with it ready to run.</p>
      </div>
      <div className="home-quick-grid">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="home-quick-card"
            onClick={() => goToAsk(action.query)}
          >
            <span className="home-quick-card__label">{action.label}</span>
            <span className="home-quick-card__desc">{action.description}</span>
            <span className="home-quick-card__hint">Open in Ask AI →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
