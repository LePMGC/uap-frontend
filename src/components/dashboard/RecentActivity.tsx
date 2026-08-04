import { DashboardService } from "@/services/dashboardService";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type RecentActivityProps = { isLoading: boolean };

export function RecentActivity({ isLoading }: RecentActivityProps) {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const data = await DashboardService.getRecentActivities();
      setActivities(data);
    } catch (error) {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Completed":
        return t("dashboard.recentActivity.completed");
      case "Pending":
        return t("dashboard.recentActivity.pending");
      case "Processing":
        return t("dashboard.recentActivity.processing");
      case "Failed":
        return t("dashboard.recentActivity.failed");
      default:
        return status;
    }
  };

  if (activitiesLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="p-6 border-b border-slate-100">
          <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
          <div className="h-3 w-48 bg-slate-100 rounded mt-2" />
        </div>
        <div className="p-4">
          <div className="h-3 w-full bg-slate-100 rounded mb-2" />
          <div className="h-3 w-full bg-slate-100 rounded mb-2" />
          <div className="h-3 w-full bg-slate-100 rounded mb-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h2 className="font-bold text-slate-800 text-base">
          {t("dashboard.recentActivity.title")}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">
                {t("dashboard.recentActivity.table.type")}
              </th>
              <th className="px-6 py-4">
                {t("dashboard.recentActivity.table.nameTrigger")}
              </th>
              <th className="px-6 py-4">
                {t("dashboard.recentActivity.table.status")}
              </th>
              <th className="px-6 py-4">
                {t("dashboard.recentActivity.table.rows")}
              </th>
              <th className="px-6 py-4">
                {t("dashboard.recentActivity.table.success")}
              </th>
              <th className="px-6 py-4">
                {t("dashboard.recentActivity.table.time")}
              </th>
              <th className="px-6 py-4 text-right">
                {t("dashboard.recentActivity.table.action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activities.map((act, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">
                    {act.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900">{act.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {act.trigger}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                      act.status === "Completed"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : act.status === "Pending" ||
                            act.status === "Processing"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                          : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {getStatusLabel(act.status)}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {act.rows}
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {act.success}
                </td>
                <td className="px-6 py-5 text-xs text-slate-400">{act.time}</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-blue-600 font-bold text-[11px] hover:text-blue-800 flex items-center justify-end gap-1 ml-auto group transition-colors">
                    {act.status === "Failed"
                      ? t("dashboard.recentActivity.viewError")
                      : t("dashboard.recentActivity.viewLog")}
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
