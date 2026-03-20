import { Search, Bell, Settings, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { providerInstanceService } from "@/services/providerInstanceService";

export function Header() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await providerInstanceService.getAll();
      if (response?.data) {
        setInstances(response.data);
      }
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to sync system status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-10 px-6 flex items-center gap-6 min-w-0">
      {/* 🔍 Search */}
      <div className="relative w-80 min-w-[200px] flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search MSISDN, Batch, Command..."
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 border border-slate-200 px-1.5 py-0.5 rounded uppercase">
          OK
        </div>
      </div>

      {/* 📊 System Info (merged) */}
      <div className="flex items-center gap-6 flex-1 min-w-0 text-xs">
        {/* Providers */}
        <div className="flex items-center gap-5 overflow-hidden">
          {instances.length > 0 ? (
            instances.map((instance) => {
              const isOnline = instance.is_active;
              const hasError = !!instance.last_error_message;

              return (
                <div
                  key={instance.id}
                  className="flex items-center gap-2 shrink-0"
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isOnline ? "bg-green-500 animate-pulse" : "bg-red-500",
                      !isOnline && !hasError && "bg-slate-300",
                    )}
                  />
                  <span className="font-semibold text-slate-700 whitespace-nowrap">
                    {instance.name}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isOnline ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {isOnline ? "Connected" : "Offline"}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="italic text-slate-300">No providers</span>
          )}
        </div>

        {/* Last Sync + Refresh */}
        <div className="flex items-center gap-2 whitespace-nowrap text-slate-400 ml-auto">
          <span className="tabular-nums">
            Last sync: <span className="text-slate-600">{lastSync}</span>
          </span>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-1 hover:bg-slate-100 rounded transition"
            title="Refresh"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                loading && "animate-spin text-indigo-500",
              )}
            />
          </button>
        </div>
      </div>

      {/* 🟢 Right Section */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase whitespace-nowrap">
            System Operational
          </span>
        </div>

        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
