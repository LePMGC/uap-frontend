import { cn } from "@/lib/utils";
import {
  Play,
  Database,
  Link2,
  Calendar,
  Edit3,
  Pause,
  Square,
  Copy,
} from "lucide-react";

export const JobConfigurationHeader = ({ data }: { data: any }) => {
  // 1. Safety Check: If data hasn't loaded yet, show a placeholder or return null
  if (!data)
    return (
      <div className="animate-pulse bg-white h-48 rounded-2xl border border-slate-200" />
    );

  const configCards = [
    {
      label: "COMMAND",
      value: data.job_specific_config?.command || data.command_name || "N/A",
      sub: "v2.1.0 • System Default",
      icon: Play,
    },
    {
      label: "DATA SOURCE",
      // Using optional chaining to safely access original_name
      value: data.source_config?.original_name || "Unknown Source",
      sub: `${data.data_source?.name || "File Upload"} • ${data.data_source?.type || "upload"}`,
      icon: Database,
    },
    {
      label: "MAPPING",
      value: `${Object.keys(data.column_mapping || {}).length} Fields Mapped`,
      sub: "View JSON Configuration",
      icon: Link2,
      action: true,
    },
    {
      label: "SCHEDULE",
      value: data.is_scheduled ? "Recurring" : "One-time Execution",
      sub: data.is_scheduled ? data.cron_expression : "Triggered manually",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{data.name}</h1>
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1",
                  data.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-700",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    data.status === "active"
                      ? "bg-emerald-500"
                      : "bg-slate-500",
                  )}
                />
                {data.status
                  ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
                  : "Inactive"}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Read-only view of job configuration and execution history.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Configuration
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50">
            <Pause className="w-4 h-4" /> Pause Job
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
            <Square className="w-4 h-4 fill-current" /> Stop
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Copy className="w-4 h-4" /> Clone
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-4 gap-4">
        {configCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <card.icon className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                {card.label}
              </span>
            </div>
            <div className="text-slate-900 font-semibold truncate">
              {card.value}
            </div>
            <div
              className={cn(
                "text-xs mt-1",
                card.action
                  ? "text-indigo-600 cursor-pointer hover:underline"
                  : "text-slate-500",
              )}
            >
              {card.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
