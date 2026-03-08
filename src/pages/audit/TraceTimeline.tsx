// src/components/audit/TraceTimeline.tsx
import { useEffect, useState } from "react";
import { auditLogService } from "@/services/auditLogService";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function TraceTimeline({ traceId }: { traceId: string }) {
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogService.getTraceTimeline(traceId).then((res) => {
      setSteps(res.data);
      setLoading(false);
    });
  }, [traceId]);

  if (loading)
    return <div className="p-4 text-center">Loading timeline...</div>;

  return (
    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
      {steps.map((step, idx) => (
        <div key={idx} className="relative pl-10">
          <div className="absolute left-0 top-1 z-10 bg-white p-0.5">
            {step.status === "SUCCESS" ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <Clock className="h-3 w-3" /> {step.timestamp}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                {step.module}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">{step.event}</h4>
            <pre className="mt-3 text-[10px] bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto font-mono">
              {JSON.stringify(step.details, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
