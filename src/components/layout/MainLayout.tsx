// src/components/layout/MainLayout.tsx

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NavigationBar } from "./NavigationBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden w-full">
      {/* Ensure Sidebar is here */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative ml-64">
        <Header />
        <NavigationBar />

        <div className="flex-1 overflow-y-auto relative p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
