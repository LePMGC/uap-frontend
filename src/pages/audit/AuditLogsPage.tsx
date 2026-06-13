// src/pages/audit/AuditLogsPage.tsx
import { useState, useEffect } from "react";
import { History, ShieldAlert, Activity, Download } from "lucide-react";
import { SecurityLogs } from "@/components/ui/audits/SecurityLogs";
import { AuditLogFeed } from "@/components/ui/audits/AuditLogFeed";
import { ConnectivityStats } from "@/components/ui/audits/ConnectivityStats";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";

type AuditTab = "feed" | "security" | "connectivity";

export default function AuditLogsPage() {
  const userPermissions = useAuthStore(
    (state) => state.user?.permissions || [],
  );

  // 1. Map all tabs along with their required viewing permission
  const allTabs = [
    {
      id: "feed",
      label: "General Feed",
      icon: History,
      permission: PERM.VIEW_AUDIT_LOGS,
    },
    {
      id: "security",
      label: "Security & Access",
      icon: ShieldAlert,
      permission: PERM.VIEW_SECURITY_LOGS,
    },
    {
      id: "connectivity",
      label: "Connectivity Stats",
      icon: Activity,
      permission: PERM.VIEW_CONNECTIVITY_STATS,
    },
  ];

  // 2. Filter tabs to only display ones the current user is permitted to see
  const allowedTabs = allTabs.filter((tab) =>
    userPermissions.includes(tab.permission),
  );

  // 3. Fallback active tab initialization state
  const [activeTab, setActiveTab] = useState<AuditTab>(() => {
    return (allowedTabs[0]?.id as AuditTab) || "feed";
  });

  // Automatically safe-guard state synchronization if permissions populate after mount
  useEffect(() => {
    if (
      allowedTabs.length > 0 &&
      !allowedTabs.some((t) => t.id === activeTab)
    ) {
      setActiveTab(allowedTabs[0].id as AuditTab);
    }
  }, [userPermissions]);

  // Check if user has global export access permission
  const canExport = userPermissions.includes(PERM.EXPORT_AUDIT_LOGS);

  // Securely intercept unauthorized access if someone hits the page with zero audit privileges
  if (allowedTabs.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 font-medium animate-in fade-in">
        You do not possess the necessary privileges to view observatory
        dashboards.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          {allowedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AuditTab)}
              className={cn(
                "flex items-center gap-2 pb-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2",
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {canExport && (
          <div className="pb-4">
            <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4" /> Export View
            </button>
          </div>
        )}
      </div>

      {/* Render Component Content Conditionally Based on Guarded State */}
      <div className="mt-4">
        {activeTab === "feed" &&
          userPermissions.includes(PERM.VIEW_AUDIT_LOGS) && <AuditLogFeed />}
        {activeTab === "security" &&
          userPermissions.includes(PERM.VIEW_SECURITY_LOGS) && <SecurityLogs />}
        {activeTab === "connectivity" &&
          userPermissions.includes(PERM.VIEW_CONNECTIVITY_STATS) && (
            <ConnectivityStats />
          )}
      </div>
    </div>
  );
}
