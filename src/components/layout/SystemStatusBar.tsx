import { RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { providerInstanceService } from "@/services/providerInstanceService";

export function SystemStatusBar() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  // Function to fetch real-time status from BE
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      // We fetch all instances to show their connectivity status
      const response = await providerInstanceService.getAll();
      if (response && response.data) {
        setInstances(response.data);
      }
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to sync system status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and set up a refresh interval (e.g., every 30 seconds)
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleManualRefresh = () => {
    fetchStatus();
  };

  return (
    <div className="h-10 border-b border-slate-200 bg-white px-6 flex items-center justify-between text-[11px] font-medium text-slate-500">
      {/* Left Section: Build & Connectivity */}
      <div className="flex items-center gap-6 overflow-hidden">
        <div className="pr-6 border-r border-slate-200 text-slate-400 shrink-0">
          UAP v2.4.1 (Build 892)
        </div>

        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          {instances.length > 0 ? (
            instances.map((instance) => {
              // Logic to determine status appearance
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
                      !isOnline && !hasError && "bg-slate-300", // Optional: neutral if just disabled
                    )}
                  />
                  <span className="font-bold text-slate-700 whitespace-nowrap">
                    {instance.name}:
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      isOnline ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {isOnline ? "Connected" : "Offline"}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="italic text-slate-300">
              No active provider instances
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Sync Info */}
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="tabular-nums">Last sync: {lastSync}</span>
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="p-1 hover:bg-slate-100 rounded transition-colors group disabled:opacity-50"
          title="Refresh Connectivity Status"
        >
          <RefreshCw
            className={cn(
              "h-3 w-3 text-slate-400 group-active:rotate-180 transition-transform duration-500",
              loading && "animate-spin text-indigo-500",
            )}
          />
        </button>
      </div>
    </div>
  );
}
