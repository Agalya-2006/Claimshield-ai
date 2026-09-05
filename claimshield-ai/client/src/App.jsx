import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Overview from "./pages/Overview.jsx";
import Claims from "./pages/Claims.jsx";
import ClaimReview from "./pages/ClaimReview.jsx";
import Analytics from "./pages/Analytics.jsx";
import PolicyRules from "./pages/PolicyRules.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import Settings from "./pages/Settings.jsx";
import { api } from "./api.js";

const PAGE_META = {
  "/": { title: "Overview", breadcrumb: "Dashboard / Overview" },
  "/claims": { title: "Claims", breadcrumb: "Dashboard / Claims" },
  "/evidence-review": { title: "Evidence Review", breadcrumb: "Dashboard / Evidence Review" },
  "/policy-rules": { title: "Policy Rules", breadcrumb: "Dashboard / Policy Rules" },
  "/analytics": { title: "Analytics", breadcrumb: "Dashboard / Analytics" },
  "/audit-logs": { title: "Audit Logs", breadcrumb: "Dashboard / Audit Logs" },
  "/settings": { title: "Settings", breadcrumb: "Dashboard / Settings" },
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api
      .health()
      .then((h) => setAiOnline(h.aiEngine === "online"))
      .catch(() => setAiOnline(false));
  }, []);

  const meta =
    PAGE_META[location.pathname] ||
    (location.pathname.startsWith("/claims/")
      ? { title: "Claim Review", breadcrumb: "Dashboard / Claims / Review" }
      : { title: "ClaimShield AI", breadcrumb: "" });

  return (
    <div className="flex min-h-screen bg-surface-bg">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          aiOnline={aiOnline}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/evidence-review" element={<Claims evidenceMode />} />
            <Route path="/claims/:id" element={<ClaimReview />} />
            <Route path="/policy-rules" element={<PolicyRules />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
