import {
  CheckCircle2,
  Edit3,
  Terminal,
  Database,
  Calendar,
  Clock,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step4Props {
  data: any;
  goToStep: (step: number) => void;
}

export function Step4Review({ data, goToStep }: Step4Props) {
  // 🕒 Cron Parser (Simplified for brevity, keep your existing logic here)
  const getHumanReadableCron = (cron: string) => {
    if (!cron) return "Not scheduled";
    // ... your existing parsing logic ...
    return cron;
  };

  // 🧮 Calculate actual mapped parameters (not excluded)
  const mappedCount = Object.values(data.column_mapping || {}).filter(
    (m: any) => !m.excluded && m.value !== "",
  ).length;

  const renderSectionHeader = (num: number, title: string, step: number) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {num}. {title}
        </h3>
      </div>
      <button
        onClick={() => goToStep(step)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
      >
        <Edit3 className="h-3 w-3 group-hover:scale-110 transition-transform" />
        Edit
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-5">
        {/* SECTION 1: SOURCE & COMMAND */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          {renderSectionHeader(1, "SOURCE & INFRASTRUCTURE", 1)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Job Name
              </p>
              <p className="text-sm font-black text-slate-900">
                {data.name || "Untitled Batch Job"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Provider Instance
              </p>
              <div className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-sm font-bold text-slate-700">
                  {data.provider_name || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Command to Execute
              </p>
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                <p className="text-sm font-bold text-indigo-600">
                  {data.command_name || data.command_id}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Data Source
              </p>
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                <span className="capitalize">{data.source_type}</span>
                <span className="text-slate-400 font-medium">
                  ({data.preview?.fileName || "External Source"})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA MAPPING SUMMARY */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          {renderSectionHeader(2, "DATA MAPPING", 2)}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 leading-none">
                  {mappedCount}
                </span>
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Parameters Configured
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Field connections verified. System will process {mappedCount}{" "}
                key-value pairs per row.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: SCHEDULE */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          {renderSectionHeader(3, "EXECUTION SCHEDULE", 3)}
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 shadow-sm">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-black text-slate-900">
                {data.is_scheduled
                  ? getHumanReadableCron(data.cron_expression)
                  : "One-Time Execution"}
              </p>

              {data.is_scheduled ? (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Cron Pattern:{" "}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">
                      {data.cron_expression || "* * * * *"}
                    </code>
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Timezone: {data.timezone || "UTC"}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium">
                  The job will be placed in the queue immediately upon launch.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
