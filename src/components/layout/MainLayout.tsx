import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SystemStatusBar } from "./SystemStatusBar";
import { NavigationBar } from "./NavigationBar";
import { Outlet } from "react-router-dom";

export default function MainLayout({}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Layer 1: Global Header */}
        <Header />

        {/* Layer 2: Real-time System Status */}
        <SystemStatusBar />

        {/* Layer 3: Contextual Navigation (Tabs) */}
        <NavigationBar />

        {/* Page content - child routes render here */}
        <div className="flex-1 overflow-auto">
          <Outlet /> {/* ← This renders child routes */}
        </div>
      </div>
    </div>
  );
}
