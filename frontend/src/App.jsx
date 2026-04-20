import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { AskAiPage } from "./pages/AskAiPage.jsx";
import { DashboardsPage } from "./pages/DashboardsPage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";
import ConnectDatabase from "./components/ConnectDatabase.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ask" element={<AskAiPage />} />
          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="data" element={<ConnectDatabase />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;