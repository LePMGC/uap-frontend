import { cn } from "@/lib/utils";

interface ExecutionStatsProps {
  instances: any[];
  selectedId: string;
  onInstanceChange: (val: string) => void;
  stats: any;
}

export const ExecutionStats = ({
  instances = [], // Default to empty array
  selectedId,
  onInstanceChange,
  stats,
}: ExecutionStatsProps) => {
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
            disabled={instances.length === 0} // Disable if empty
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {instances.length > 0 ? (
              instances.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name || `#EXEC-${inst.id.toString().substring(0, 8)}`} -{" "}
                  {inst.executed_at
                    ? new Date(inst.executed_at).toLocaleString()
                    : "Pending..."}
                </option>
              ))
            ) : (
              <option value="">No executions found</option>
            )}
          </select>
        </div>
      </div>

      {/* Grid stays the same, but ensure stats values are safe */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Input Records", val: stats?.total ?? 0 },
          {
            label: "Commands Executed",
            val: stats?.executed ?? 0,
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
