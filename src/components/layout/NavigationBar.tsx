// src/components/layout/NavigationBar.tsx
import React from "react";
import { X, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTabStore } from "@/store/tabStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function NavigationBar() {
  const { t } = useTranslation();
  const { tabs, activeTabId, removeTab } = useTabStore();
  const navigate = useNavigate();

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const nextTab = removeTab(id);

    requestAnimationFrame(() => {
      if (nextTab) {
        navigate(nextTab.url);
      } else {
        navigate("/dashboard");
      }
    });
  };

  const getTranslatedTitle = (tab: any) => {
    const cleanId = tab.id.replace(/^\/+|\/+$/g, "");
    if (cleanId === "dashboard") {
      return t("navigation.dashboard");
    }
    return tab.title;
  };

  return (
    <div className="h-10 border-b border-slate-200 bg-slate-50/50 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 shrink-0">
      {tabs.map((tab: any) => {
        const isActive = activeTabId === tab.id;
        const Icon = tab.icon || LayoutDashboard;

        return (
          <div
            key={tab.id}
            onClick={() => {
              navigate(tab.url);
            }}
            className={cn(
              "h-full flex items-center px-3 gap-2 border-x border-t cursor-pointer transition-all text-[11px] font-bold rounded-t-sm translate-y-[1px] shrink-0 max-w-[160px]",
              isActive
                ? "bg-white border-slate-200 text-blue-600 shadow-[0_-2px_0_0_rgba(37,99,235,1)]"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-600",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{getTranslatedTitle(tab)}</span>

            {/* Close button - hidden for dashboard */}
            {tab.id !== "dashboard" && (
              <X
                onClick={(e: React.MouseEvent) => handleCloseTab(e, tab.id)}
                className="h-3 w-3 ml-1 hover:text-red-500 transition-colors"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
