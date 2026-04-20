import { useState } from "react";
import { Outlet } from "react-router-dom";

import { ChatbotWidget } from "../components/ChatbotWidget.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-column ${collapsed ? "main-column--collapsed" : ""}`}>
        <TopBar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
