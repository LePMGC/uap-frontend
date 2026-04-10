// src/pages/leap-journey/components/LogInputZone.tsx
import { useState } from "react";
import { Terminal, Play, Trash2, Loader2 } from "lucide-react";
import { useLeapStore } from "@/store/useLeapStore";
import { leapLogService } from "@/services/leapLogService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";

export function LogInputZone() {
  const [rawLogs, setRawLogs] = useState("");
  const { setJourneys, setIsLoading, isLoading, reset } = useLeapStore();
  const { showToast } = useToastStore();

  const handleParse = async () => {
    if (!rawLogs.trim()) return;

    setIsLoading(true);
    try {
      const response = await leapLogService.parse(rawLogs);
      if (response.success) {
        setJourneys(response.data);
        showToast(
          `Successfully parsed ${response.data.length} journeys`,
          "success",
        );
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to parse logs",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRawLogs("");
    reset();
  };

  return (
    <div className="space-y-3">
      <div className="relative group">
        <div className="absolute top-3 left-4 flex items-center gap-2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Terminal className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Raw Log Input
          </span>
        </div>

        <textarea
          value={rawLogs}
          onChange={(e) => setRawLogs(e.target.value)}
          placeholder="Paste your Leap logs here (e.g. 2026-04-06T20:44:05.660|111758...)"
          className="w-full h-32 pl-4 pt-10 pr-4 pb-4 bg-slate-900 text-slate-300 font-mono text-xs rounded-2xl border-2 border-slate-800 focus:border-indigo-500 outline-none transition-all resize-none custom-scrollbar"
        />

        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={handleClear}
            disabled={!rawLogs || isLoading}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            title="Clear All"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={handleParse}
            disabled={!rawLogs || isLoading}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95",
              !rawLogs || isLoading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20",
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Parse Logs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
