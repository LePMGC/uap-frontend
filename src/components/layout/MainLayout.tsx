// src/components/layout/MainLayout.tsx

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NavigationBar } from "./NavigationBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    /* h-screen is fine here to keep the sidebar fixed */
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header />
        <NavigationBar />

        {/* FIX: Change overflow-hidden to overflow-y-auto */}
        <div className="flex-1 overflow-y-auto relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
