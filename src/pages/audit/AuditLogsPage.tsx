// src/pages/audit/AuditLogsPage.tsx
import { useState } from "react";
import { History, ShieldAlert, Activity, Download } from "lucide-react";
import { SecurityLogs } from "@/components/ui/audits/SecurityLogs";
import { AuditLogFeed } from "@/components/ui/audits/AuditLogFeed";
import { ConnectivityStats } from "@/components/ui/audits/ConnectivityStats";
import { cn } from "@/lib/utils";

type AuditTab = "feed" | "security" | "connectivity";

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState<AuditTab>("feed");

  const tabs = [
    { id: "feed", label: "General Feed", icon: History },
    { id: "security", label: "Security & Access", icon: ShieldAlert },
    { id: "connectivity", label: "Connectivity Stats", icon: Activity },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AuditTab)}
              className={cn(
                // Changed text-sm to text-[11px], added uppercase and tracking-tight
                "flex items-center gap-2 pb-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2",
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              )}
            >
              {/* Slightly smaller icon to match the smaller text */}
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pb-4">
          {/* Global Actions like Export */}
          <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2">
            <Download className="h-4 w-4" /> Export View
          </button>
        </div>
      </div>

      {/* Render Content Based on Tab */}
      <div className="mt-4">
        {activeTab === "feed" && <AuditLogFeed />}
        {activeTab === "security" && <SecurityLogs />}
        {activeTab === "connectivity" && <ConnectivityStats />}
      </div>
    </div>
  );
}
