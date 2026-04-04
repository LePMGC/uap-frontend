import { cn } from "@/lib/utils";

interface ExecutionStatsProps {
  instances: any[];
  selectedId: string;
  onInstanceChange: (val: string) => void;
  stats: any;
}

export const ExecutionStats = ({
  instances = [],
  selectedId,
  onInstanceChange,
  stats,
}: ExecutionStatsProps) => {
  // Calculate progress percentage
  const total = stats?.total ?? 0;
  const executed = stats?.executed ?? 0;
  const progress = total > 0 ? Math.round((executed / total) * 100) : 0;

  // Status check for progress bar
  const isProcessing = stats?.status === "processing";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Batch Instance Report
          </h2>
          <p className="text-sm text-slate-500">
            Execution statistics for selected instance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            Select Instance:
          </span>
          <select
            value={selectedId}
            onChange={(e) => onInstanceChange(e.target.value)}
            disabled={instances.length === 0}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {instances.length > 0 ? (
              instances.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name || `#EXEC-${inst.id.toString().substring(0, 8)}`} -{" "}
                  {inst.completed_at
                    ? new Date(inst.completed_at).toLocaleString()
                    : inst.status || "Unknown Status"}
                </option>
              ))
            ) : (
              <option value="">No executions found</option>
            )}
          </select>
        </div>
      </div>

      {/* Progress Bar Section - Only shows when status is 'processing' */}
      {isProcessing && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-indigo-600 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Processing Records...
            </span>
            <span className="text-sm font-bold text-slate-700">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Input Records", val: total },
          {
            label: "Commands Executed",
            val: executed,
            color: "text-indigo-600",
          },
          {
            label: "Successful",
            val: stats?.success ?? 0,
            color: "text-emerald-600",
          },
          {
            label: "Failed Executions",
            val: stats?.failed ?? 0,
            color: "text-red-500",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-500 mb-2">{s.label}</p>
            <p
              className={cn("text-3xl font-bold", s.color || "text-slate-900")}
            >
              {(s.val || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
