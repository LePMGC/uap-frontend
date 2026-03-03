import { useEffect, useState } from "react";
import { DashboardService } from "@/services/dashboardService";

interface PlatformService {
  name: string;
  status: string;
  status_type: "healthy" | "warning" | "critical";
  message: string | null;
}

export function PlatformHealth({
  isLoading: externalLoading,
}: {
  isLoading: boolean;
}) {
  const [statusItems, setStatusItems] = useState<PlatformService[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const data = await DashboardService.getPlatformHealth();
      setStatusItems(data);
    } catch (error) {
      setStatusItems([]);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const showSkeleton = externalLoading || internalLoading;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="font-bold text-slate-800 text-base mb-6">
        Platform Health
      </h2>

      <div className="space-y-4">
        {showSkeleton
          ? // Skeleton loader matches the height of real items
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[62px] w-full bg-slate-50 border border-slate-100 rounded-lg animate-pulse"
              />
            ))
          : statusItems.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-lg border border-slate-100 bg-slate-50/30 transition-hover hover:bg-slate-50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status_type === "healthy"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="text-sm font-bold text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status_type === "healthy"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
