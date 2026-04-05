import { Calendar, Clock, Timer, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export const InstanceInfoCard = ({ stats }: { stats: any }) => {
  if (!stats) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    if (!stats.started_at || !stats.completed_at) return "---";
    const start = new Date(stats.started_at).getTime();
    const end = new Date(stats.completed_at).getTime();
    const diffInSeconds = Math.floor((end - start) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    return `${Math.floor(diffInSeconds / 60)}m ${diffInSeconds % 60}s`;
  };

  const statusColors: any = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-indigo-50 text-indigo-600 border-indigo-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    failed: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Activity className="w-4 h-4 text-indigo-500" />
          Instance Information
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
            statusColors[stats.status] || "bg-slate-50 text-slate-600",
          )}
        >
          {stats.status}
        </span>
      </div>

      <div className="p-4">
        {/* Single Row Layout for Time Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {/* Started At */}
          <div className="flex items-center gap-3 border-r border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                Started At
              </p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {formatDate(stats.started_at)}
              </p>
            </div>
          </div>

          {/* Completed At */}
          <div className="flex items-center gap-3 border-r border-slate-100">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                Completed At
              </p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {stats.completed_at ? formatDate(stats.completed_at) : "---"}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <Timer className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                Duration
              </p>
              <p className="text-xs font-semibold text-indigo-600 truncate">
                {getDuration()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
