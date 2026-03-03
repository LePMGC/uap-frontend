import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock data to simulate real-time updates
const PROVIDER_STATUS = [
  {
    name: "ECS",
    status: "Connected",
    latency: "12ms",
    color: "text-green-500",
    dot: "bg-green-500",
  },
  {
    name: "LEAP",
    status: "Online",
    latency: null,
    color: "text-green-500",
    dot: "bg-green-500",
  },
  {
    name: "EDA",
    status: "Degraded",
    latency: null,
    color: "text-amber-500",
    dot: "bg-amber-500",
  },
];

export function SystemStatusBar() {
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  // Function to simulate refreshing data
  const handleRefresh = () => {
    setLastSync(new Date().toLocaleTimeString());
  };

  return (
    <div className="h-10 border-b border-slate-200 bg-white px-6 flex items-center justify-between text-[11px] font-medium text-slate-500">
      {/* Left Section: Build & Connectivity */}
      <div className="flex items-center gap-6">
        <div className="pr-6 border-r border-slate-200 text-slate-400">
          UAP v2.4.1 (Build 892)
        </div>

        <div className="flex items-center gap-5">
          {PROVIDER_STATUS.map((provider) => (
            <div key={provider.name} className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", provider.dot)} />
              <span className="font-bold text-slate-700">{provider.name}:</span>
              <span className={provider.color}>{provider.status}</span>
              {provider.latency && (
                <span className="text-slate-300 font-normal">
                  {provider.latency}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Sync Info */}
      <div className="flex items-center gap-3">
        <span>Last sync: {lastSync}</span>
        <button
          onClick={handleRefresh}
          className="p-1 hover:bg-slate-100 rounded transition-colors group"
        >
          <RefreshCw className="h-3 w-3 text-slate-400 group-active:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
