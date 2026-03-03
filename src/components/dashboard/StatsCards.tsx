import { DashboardService } from "@/services/dashboardService";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardsProps {
  isLoading?: boolean;
}

export function StatsCards({}: StatsCardsProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (error) {
      setStats([]);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Skeleton Placeholder array
  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-pulse"
          >
            <div className="h-2 w-16 bg-slate-100 rounded mb-3" />
            <div className="h-6 w-20 bg-slate-200 rounded mb-3" />
            <div className="h-3 w-24 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {s.label}
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{s.value}</h3>
          <div className="flex items-center gap-1 mt-2">
            <div
              className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                s.trend === "up"
                  ? "text-green-600 bg-green-50"
                  : s.trend === "down"
                    ? "text-red-600 bg-red-50"
                    : "text-slate-500 bg-slate-50"
              }`}
            >
              {s.trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : s.trend === "down" ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <Minus className="h-3 w-3 mr-1" />
              )}
              {s.change}
            </div>
            <span className="text-[10px] text-slate-400">{s.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
