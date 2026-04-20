export const features = [
  {
    id: "nl",
    title: "Natural Language Queries",
    description:
      "Ask business questions the way you talk—no SQL syntax, no training. The system understands intent and context.",
  },
  {
    id: "sql",
    title: "Auto SQL Generation",
    description:
      "Transparent, read-only SELECT statements are generated for you. Review the exact query behind every answer.",
  },
  {
    id: "viz",
    title: "Smart Visualizations",
    description:
      "Charts adapt to your data—bars for comparisons, lines for trends, KPIs for single metrics.",
  },
  {
    id: "insight",
    title: "Insight Generation",
    description:
      "Move from raw tables to decisions faster: see SQL, numbers, and visuals in one coherent flow.",
  },
];

export const quickActions = [
  {
    id: "sales",
    label: "Analyze Sales",
    query: "Show total order amount grouped by month",
    description: "Trends and aggregates across your orders",
  },
  {
    id: "customers",
    label: "Customer Insights",
    query: "Which users have the highest total order amount?",
    description: "Rank and compare customer value",
  },
  {
    id: "products",
    label: "Product Performance",
    query: "Show revenue per product from orders",
    description: "Product-level revenue at a glance",
  },
];

export const sampleInsights = [
  {
    id: "1",
    headline: "Top customer contributes 77% of revenue",
    detail: "Spot concentration risk and prioritize retention.",
  },
  {
    id: "2",
    headline: "Sales increased 12% this month",
    detail: "Compare periods to validate growth before you scale spend.",
  },
  {
    id: "3",
    headline: "Orders peaked in March",
    detail: "Align inventory and campaigns with seasonal demand.",
  },
];
