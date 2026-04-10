// /var/www/html/uap-frontend/src/components/leap_logs/JourneyList.tsx
import { useLeapStore } from "@/store/useLeapStore";
import { cn } from "@/lib/utils";
import { Box, ChevronRight, Clock, Hash } from "lucide-react";
import { useMemo } from "react";

export function JourneyList() {
  const { journeys, selectedTid, setSelectedTid } = useLeapStore();

  const displaySegments = useMemo(() => {
    return journeys.map((j, index) => ({
      // Logical identifier is now the index to handle duplicates
      selectionId: String(index),
      name: j.app_instance,
      startTime: new Date(j.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      stepCount: j.logs.length,
      isReturnTrip:
        journeys.filter((other) => other.app_instance === j.app_instance)
          .length > 1,
    }));
  }, [journeys]);

  if (journeys.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs font-medium text-slate-400">No logs processed</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50/30">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Application Flow Segments
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {displaySegments.map((segment, index) => {
          // Compare against selectionId (the index string)
          const isSelected = selectedTid === segment.selectionId;

          return (
            <button
              key={`${segment.name}-${index}`}
              onClick={() => setSelectedTid(segment.selectionId)}
              className={cn(
                "w-full text-left p-4 transition-all hover:bg-slate-50 flex items-start gap-3 group",
                isSelected
                  ? "bg-indigo-50/50 ring-1 ring-inset ring-indigo-100"
                  : "bg-white",
              )}
            >
              <div
                className={cn(
                  "mt-1 p-2 rounded-xl shrink-0 transition-colors",
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200",
                )}
              >
                <Box className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      isSelected ? "text-indigo-900" : "text-slate-700",
                    )}
                  >
                    {segment.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-mono">
                      #{index + 1}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isSelected
                          ? "text-indigo-400 translate-x-1"
                          : "text-slate-300",
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-300" />
                    {segment.startTime}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Hash className="h-3.5 w-3.5 text-slate-300" />
                    {segment.stepCount} steps
                  </div>
                </div>

                {segment.isReturnTrip && (
                  <div className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-tighter border border-amber-100">
                    Segment of multi-hop flow
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
