import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  RefreshCw,
  Info,
  Play,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step3Props {
  data: any;
  updateData: (newData: Partial<any>) => void;
}

type Frequency = "minute" | "hourly" | "daily" | "weekly" | "monthly";

export function Step3Scheduling({ data, updateData }: Step3Props) {
  // Initialize state from existing data to persist values when navigating back
  const [scheduleType, setScheduleType] = useState<"once" | "recurring">(
    data.is_scheduled ? "recurring" : "once",
  );

  const [freq, setFreq] = useState<Frequency>(data.frequency || "daily");
  const [time, setTime] = useState(data.execution_time || "");
  const [dayOfWeek, setDayOfWeek] = useState(data.day_of_week || "1");
  const [dayOfMonth, setDayOfMonth] = useState(data.day_of_month || "1");
  const [humanReadable, setHumanReadable] = useState("");

  // 1. VALIDATION LOGIC
  useEffect(() => {
    let isValid = true;

    if (scheduleType === "recurring") {
      // Rule: Execution Time is mandatory for Daily/Weekly/Monthly
      const needsTime = ["daily", "weekly", "monthly"].includes(freq);
      if (needsTime && !time) {
        isValid = false;
      }

      // Rule: Start Date is required for recurring
      if (!data.starts_at) {
        isValid = false;
      }

      // Rule: End Date must be after Start Date
      if (data.starts_at && data.ends_at) {
        const start = new Date(data.starts_at).getTime();
        const end = new Date(data.ends_at).getTime();
        if (end <= start) {
          isValid = false;
        }
      }
    }

    // Update parent validity state
    if (data.step3Valid !== isValid) {
      updateData({ step3Valid: isValid });
    }
  }, [data.starts_at, data.ends_at, scheduleType, freq, time, data.step3Valid]);

  // Helper to format the human-readable string
  const generateDescription = (
    f: Frequency,
    t: string,
    dow: string,
    dom: string,
  ) => {
    if (!t && ["daily", "weekly", "monthly"].includes(f))
      return "Waiting for time selection...";

    const [hh, mm] = t ? t.split(":") : ["00", "00"];
    const timeStr = `${hh}:${mm}`;
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    switch (f) {
      case "minute":
        return `Every ${dom || 15} minutes`;
      case "hourly":
        return `At the start of every hour`;
      case "daily":
        return `Every day at ${timeStr}`;
      case "weekly":
        return `Every ${days[parseInt(dow)]} at ${timeStr}`;
      case "monthly":
        return dom === "L"
          ? `On the last day of every month at ${timeStr}`
          : `On the ${dom}${getOrdinal(dom)} of every month at ${timeStr}`;
      default:
        return "";
    }
  };

  const getOrdinal = (n: string) => {
    const s = ["th", "st", "nd", "rd"],
      v = parseInt(n) % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // 2. CRON & DATA SYNC
  useEffect(() => {
    if (scheduleType === "once") {
      const desc = "Executes immediately upon creation";
      setHumanReadable(desc);
      updateData({
        schedule_description: desc,
        is_scheduled: false,
        execution_time: "",
        cron_expression: "",
      });
      return;
    }

    const [hh, mm] = time ? time.split(":") : ["00", "00"];
    let cron = "";

    switch (freq) {
      case "minute":
        cron = `*/${dayOfMonth || 15} * * * *`;
        break;
      case "hourly":
        cron = `0 * * * *`;
        break;
      case "daily":
        cron = `${mm} ${hh} * * *`;
        break;
      case "weekly":
        cron = `${mm} ${hh} * * ${dayOfWeek}`;
        break;
      case "monthly":
        const dom = dayOfMonth === "L" ? "L" : dayOfMonth;
        cron = `${mm} ${hh} ${dom} * *`;
        break;
    }

    const desc = generateDescription(freq, time, dayOfWeek, dayOfMonth);
    setHumanReadable(desc);

    // Save all fields to parent to ensure persistence
    updateData({
      cron_expression: cron,
      schedule_description: desc,
      is_scheduled: true,
      execution_time: time,
      frequency: freq,
      day_of_week: dayOfWeek,
      day_of_month: dayOfMonth,
    });
  }, [freq, time, dayOfWeek, dayOfMonth, scheduleType]);

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* MODE TOGGLE */}
      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] max-w-sm mx-auto shadow-inner">
        {(["once", "recurring"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setScheduleType(mode)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-[11px] uppercase tracking-wider transition-all",
              scheduleType === mode
                ? "bg-white shadow-md text-indigo-600"
                : "text-slate-400 hover:text-slate-500",
            )}
          >
            {mode === "once" ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {mode === "once" ? "Run Once" : "Recurring"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="space-y-6">
          {scheduleType === "recurring" && (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Frequency
                </label>
                <div className="flex flex-wrap gap-2">
                  {["minute", "hourly", "daily", "weekly", "monthly"].map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setFreq(f as Frequency)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl border text-[12px] font-bold transition-all capitalize",
                          freq === f
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
                        )}
                      >
                        {f}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                {["daily", "weekly", "monthly"].includes(freq) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Execution Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-12 px-10 rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none"
                      />
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                )}

                {freq === "weekly" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      On Day
                    </label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none appearance-none bg-white"
                    >
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                      <option value="0">Sunday</option>
                    </select>
                  </div>
                )}

                {freq === "monthly" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      On Day of Month
                    </label>
                    <select
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none appearance-none bg-white"
                    >
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                      <option value="L">Last Day of Month</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Effective From
                  </label>
                  <input
                    type="datetime-local"
                    value={data.starts_at || ""}
                    onChange={(e) => updateData({ starts_at: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-[12px] font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Effective Until
                  </label>
                  <input
                    type="datetime-local"
                    value={data.ends_at || ""}
                    onChange={(e) => updateData({ ends_at: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-[12px] font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {scheduleType === "once" && (
            <div className="bg-indigo-50/50 border-2 border-indigo-100 border-dashed rounded-[2.5rem] p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-indigo-500">
                <Play fill="currentColor" className="h-6 w-6" />
              </div>
              <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[13px]">
                One-Time Task
              </h4>
              <p className="text-indigo-600/60 text-sm max-w-[280px] mx-auto leading-relaxed">
                This job will execute immediately once saved. No recurring
                schedule will be created.
              </p>
            </div>
          )}
        </div>

        {/* SUMMARY PANEL */}
        <aside className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 sticky top-6 shadow-2xl">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Active Schedule
            </h4>
            <p className="text-[13px] font-bold text-indigo-400 leading-tight">
              {humanReadable}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <Clock className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                  Cron Expression
                </p>
                <p className="text-lg font-mono text-white tracking-wider">
                  {scheduleType === "once"
                    ? "N/A"
                    : data.cron_expression || "Waiting..."}
                </p>
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase">
                  Starts At
                </p>
                <p className="text-[11px] text-slate-200 flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  {formatFullDate(data.starts_at) ||
                    "Immediately upon creation"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase">
                  Ends At
                </p>
                <p className="text-[11px] text-slate-200 flex items-center gap-2">
                  <CalendarRange className="h-3 w-3 text-slate-500" />
                  {formatFullDate(data.ends_at) || "Manual termination"}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Timezone
                </span>
                <span className="text-[10px] text-slate-200 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {data.timezone || "UTC"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <div className="flex gap-3">
              <Info className="h-4 w-4 text-indigo-400 shrink-0" />
              <p className="text-[10px] text-indigo-200/70 leading-relaxed italic">
                The batch engine will monitor this schedule and fire the command
                automatically within the specified period.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
