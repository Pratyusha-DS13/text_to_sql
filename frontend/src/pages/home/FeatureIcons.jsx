export function IconNaturalLanguage(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden {...props}>
      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

export function IconSql(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden {...props}>
      <path d="M4 7h16M4 12h10M4 17h7" />
      <path d="M17 14l3 3-3 3" />
    </svg>
  );
}

export function IconVisualization(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden {...props}>
      <path d="M4 19V5M4 19h16M8 15v4M12 11v8M16 7v12" />
    </svg>
  );
}

export function IconInsight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden {...props}>
      <path d="M9 18h6M10 22h4M12 3a7 7 0 017 7c0 2.5-1.5 4.5-3 6h-8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z" />
    </svg>
  );
}

const icons = [IconNaturalLanguage, IconSql, IconVisualization, IconInsight];

export function FeatureIcon({ index, className }) {
  const Cmp = icons[index] ?? IconNaturalLanguage;
  return <Cmp className={className} />;
}
