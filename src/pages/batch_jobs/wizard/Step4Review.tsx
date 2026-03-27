import {
  CheckCircle2,
  Edit3,
  Terminal,
  Database,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step4Props {
  data: any;
  goToStep: (step: number) => void;
}

export function Step4Review({ data, goToStep }: Step4Props) {
  // 🕒 Helper function to parse standard cron expressions into human-readable text
  const getHumanReadableCron = (cron: string) => {
    if (!cron) return "Not scheduled";
    if (cron === "0 0 * * *") return "Runs Every Day";
    if (cron === "*/15 * * * *") return "Runs Every 15 Minutes";
    if (cron === "0 8 * * 1") return "Runs Every Monday";

    const parts = cron.split(" ");
    if (parts.length !== 5) return cron;

    const [min, hour, dom, month, dow] = parts;

    if (
      min.startsWith("*/") &&
      hour === "*" &&
      dom === "*" &&
      month === "*" &&
      dow === "*"
    ) {
      return `Runs Every ${min.replace("*/", "")} Minutes`;
    }
    if (
      min === "0" &&
      hour === "*" &&
      dom === "*" &&
      month === "*" &&
      dow === "*"
    ) {
      return "Runs Every Hour";
    }
    if (dom === "*" && month === "*" && dow === "*") {
      return `Runs Every Day at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
    }
    if (dom === "*" && month === "*" && dow !== "*") {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayNames = dow
        .split(",")
        .map((d) => days[parseInt(d)] || d)
        .join(", ");
      return `Runs Weekly on ${dayNames}`;
    }
    if (dom !== "*" && month === "*" && dow === "*") {
      const daySuffix = dom === "L" ? "Last Day" : `Day ${dom}`;
      return `Runs Monthly on the ${daySuffix}`;
    }

    return "Recurring Batch Job"; // Fallback
  };

  const renderSectionHeader = (num: number, title: string, step: number) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {num}. {title}
        </h3>
      </div>
      <button
        onClick={() => goToStep(step)} // 🔗 Redirects to the step
        className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
      >
        <Edit3 className="h-3 w-3 group-hover:scale-110 transition-transform" />
        Edit
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">
          Step 4: Review & Confirm
        </h2>
        <p className="text-xs text-slate-500">
          Review your configuration and confirm to create your batch job.
        </p>
      </div>

      <div className="grid gap-5">
        {/* SECTION 1: SOURCE & COMMAND */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {renderSectionHeader(1, "SOURCE & COMMAND", 1)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Job Name
              </p>
              <p className="text-sm font-bold text-slate-800">
                {data.name || "Untitled Job"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Command
              </p>
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                <p className="text-sm font-bold text-slate-800">
                  {data.command_id || "UpdateCRMUser (v2.1)"}
                </p>
              </div>
            </div>
            <div className="col-span-full pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                Data Source Setup
              </p>
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Database className="h-4 w-4 text-indigo-500" />
                <span className="capitalize">{data.source_type}</span> (
                {data.preview?.fileName || "users_export.csv"})
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA MAPPING */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {renderSectionHeader(2, "DATA MAPPING", 2)}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-tight">
                {Object.keys(data.mapping || {}).length} Fields Mapped
              </span>
            </div>
            <p className="text-xs text-slate-400 italic">
              Values have been correctly mapped to the target parameters.
            </p>
          </div>
        </div>

        {/* SECTION 3: SCHEDULE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {renderSectionHeader(3, "SCHEDULE", 3)}
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              {/* 📖 Text Interpretation */}
              <p className="text-sm font-bold text-slate-800">
                {data.is_scheduled
                  ? getHumanReadableCron(data.cron_expression)
                  : "Runs One-Time Immediately"}
              </p>

              {/* ⚙️ Cron Format Expression alongside text Interpretation */}
              {data.is_scheduled && (
                <p className="text-[11px] text-slate-400 font-mono tracking-wider">
                  At frequency of "{data.cron_expression || "Not Configured"}"
                  in {data.timezone || "UTC"}
                </p>
              )}

              {data.starts_at && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                    <Clock className="h-3 w-3" />
                    Starts:{" "}
                    {new Date(data.starts_at).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
