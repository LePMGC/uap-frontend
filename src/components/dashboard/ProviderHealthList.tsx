import { DashboardService } from "@/services/dashboardService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function ProviderHealthList() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const fetchHealth = async () => {
    try {
      const data = await DashboardService.getPrividersHealth();
      setData(data);
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-800 text-base">
          {t("dashboard.providerHealth.title")}
        </h2>
        <button className="text-blue-600 text-xs font-semibold hover:underline">
          {t("dashboard.viewAll")}
        </button>
      </div>

      <div className="space-y-4">
        {data.map((p) => {
          const isHealthy = p.status === "Healthy";
          return (
            <div
              key={p.name}
              className="p-4 rounded-lg border border-slate-100 bg-slate-50/30"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-slate-700 text-sm">
                  {p.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isHealthy
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isHealthy ? t("dashboard.healthy") : t("dashboard.warning")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t("dashboard.providerHealth.latency")}
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {p.metrics.latency}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t("dashboard.providerHealth.errorRate")}
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {p.metrics.errorRate}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t("dashboard.providerHealth.uptime")}
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {p.metrics.uptime}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
