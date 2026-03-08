// src/components/layout/MainLayout.tsx

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SystemStatusBar } from "./SystemStatusBar";
import { NavigationBar } from "./NavigationBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <SystemStatusBar />
        <NavigationBar />

        <div className="flex-1 overflow-auto">
          {/* Outlet is the standard way to render child routes in 
              React Router 6+ layouts. 
          */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
