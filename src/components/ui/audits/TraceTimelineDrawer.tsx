// src/components/audit/TraceTimelineDrawer.tsx
import { TraceTimeline } from "@/pages/audit/TraceTimeline";
import { X } from "lucide-react";

export function TraceTimelineDrawer({
  traceId,
  onClose,
}: {
  traceId: string | null;
  onClose: () => void;
}) {
  if (!traceId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6">
          <h2 className="text-lg font-bold text-slate-900">Trace Timeline</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-mono text-xs">
            TRACE_ID: {traceId}
          </div>
          <TraceTimeline traceId={traceId} />
        </div>
      </div>
    </div>
  );
}
