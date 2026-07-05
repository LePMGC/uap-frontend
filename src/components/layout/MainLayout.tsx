// src/components/layout/MainLayout.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NavigationBar } from "./NavigationBar";
import { useTabStore } from "@/store/tabStore";
import { renderTabContent } from "@/config/tabRenderConfig";
import { cn } from "@/lib/utils";

// Helper to get tab name from the base domain path
function getTabTitleFromPath(basePath: string): string {
  if (!basePath || basePath === "dashboard") return "Dashboard";
  const clean = basePath.replace(/^\/+|\/+$/g, "").replace(/-/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export default function MainLayout() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);

  const location = useLocation();

  // ROUTER WATCHER: Groups nested layouts into their parent feature tab
  useEffect(() => {
    const currentUrl = location.pathname;

    const cleanPath = currentUrl.replace(/^\/+|\/+$/g, "");
    if (!cleanPath) return;

    const derivedTabId = cleanPath.split("/")[0];

    const { closingTabId } = useTabStore.getState();

    // 🚨 CRITICAL: prevent recreation during close cycle
    if (closingTabId === derivedTabId) {
      return;
    }

    const existingTab = tabs.find(
      (t) => t.id.replace(/^\/+|\/+$/g, "") === derivedTabId,
    );

    if (!existingTab) {
      useTabStore.getState().addTab({
        id: derivedTabId,
        title: getTabTitleFromPath(derivedTabId),
        url: currentUrl,
      });

      return;
    }

    if (existingTab.url !== currentUrl) {
      useTabStore.setState({
        tabs: tabs.map((t) =>
          t.id === existingTab.id ? { ...t, url: currentUrl } : t,
        ),
      });
    }

    if (activeTabId !== existingTab.id) {
      setActiveTab(existingTab.id);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden w-full">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative ml-64">
        <Header />
        <NavigationBar />

        {/* Dynamic Multi-Tab Content Layer */}
        <div className="flex-1 overflow-y-auto relative p-6">
          {tabs.map((tab: any) => {
            const cleanTId = tab.id.replace(/^\/+|\/+$/g, "");
            const cleanActiveId = activeTabId?.replace(/^\/+|\/+$/g, "");

            return (
              <div
                key={tab.id}
                className={cn(
                  "w-full h-full",
                  cleanTId === cleanActiveId ? "block" : "hidden",
                )}
              >
                {/* Pass the feature ID and the active sub-view path down */}
                {renderTabContent(tab.id, tab.url)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
