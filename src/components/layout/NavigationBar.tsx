import { X, LayoutDashboard } from "lucide-react";
import { useTabStore } from "@/store/tabStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  const { tabs, activeTabId, removeTab, setActiveTab } = useTabStore();
  const navigate = useNavigate();

  const handleTabClick = (tab: any) => {
    setActiveTab(tab.id);
    navigate(tab.url);
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const tabToCloseIsActive = activeTabId === id;
    removeTab(id);

    if (tabToCloseIsActive) {
      const remainingTabs = tabs.filter((t) => t.id !== id);
      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[remainingTabs.length - 1];
        setActiveTab(nextTab.id);
        navigate(nextTab.url);
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="h-10 border-b border-slate-200 bg-slate-50/50 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const Icon = tab.icon || LayoutDashboard;

        return (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "h-full flex items-center px-3 gap-2 border-x border-t cursor-pointer transition-all text-[11px] font-bold rounded-t-sm translate-y-[1px]",
              isActive
                ? "bg-white border-slate-200 text-blue-600 shadow-[0_-2px_0_0_rgba(37,99,235,1)]"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-600",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate max-w-[100px]">{tab.title}</span>

            {/* Close Icon - Only show if more than 1 tab or not dashboard */}
            {tab.id !== "dashboard" && (
              <button
                onClick={(e) => handleClose(e, tab.id)}
                className="p-0.5 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
