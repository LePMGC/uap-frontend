import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SystemStatusBar } from "./SystemStatusBar";
import { NavigationBar } from "./NavigationBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar />

      {/* Added min-w-0 and overflow-hidden to prevent the Results panel from expanding the window */}
      <div className="flex-1 ml-64 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header />
        <SystemStatusBar />
        <NavigationBar />

        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
