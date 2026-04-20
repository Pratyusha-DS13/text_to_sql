import { FeatureGrid } from "./home/FeatureGrid.jsx";
import { HomeHero } from "./home/HomeHero.jsx";
import "./home/HomePage.css";
import { QuickActions } from "./home/QuickActions.jsx";
import { SampleInsights } from "./home/SampleInsights.jsx";

export function HomePage() {
  return (
    <div className="page home">
      <HomeHero />
      <FeatureGrid />
      <QuickActions />
      <SampleInsights />
    </div>
  );
}
