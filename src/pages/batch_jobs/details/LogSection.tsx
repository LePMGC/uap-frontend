import { RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogSectionProps {
  logs: any[];
  errors: any[];
  onRetryFailed: () => void;
}

export const LogSection = ({
  logs,
  errors,
  onRetryFailed,
}: LogSectionProps) => {
  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      {/* Error Analysis Sidebar */}
      <div className="col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800">
          <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            !
          </div>
          Error Analysis
        </div>
        <div className="p-4 space-y-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-50">
                <th className="pb-2 font-medium">Error Code</th>
                <th className="pb-2 font-medium text-right">Count</th>
              </tr>
            </thead>
            <tbody className="text-red-600 font-medium">
              {errors.length > 0 ? (
                errors.map((err, i) => (
                  <tr key={i}>
                    <td className="py-3 uppercase tracking-tight">
                      {err.code}
                    </td>
                    <td className="py-3 text-right">{err.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="py-8 text-center text-slate-400 font-normal"
                  >
                    No errors analyzed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-200">
            {["All", "Success", "Failed", "Pending"].map((tab) => (
              <button
                key={tab}
                className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all hover:bg-white hover:shadow-sm"
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={onRetryFailed}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm shadow-indigo-200 hover:bg-indigo-700"
          >
            <RotateCcw className="w-4 h-4" /> Retry Failed
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                  Command
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                  Identifier
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                  Execution Time
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isSuccess = log.result?.is_successful;
                  const identifier =
                    log.payloads?.request?.data?.subscriberNumber || "N/A";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {isSuccess ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {log.command_info?.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {identifier}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {log.metadata?.execution_time}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
                        {log.metadata?.timestamp}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400 text-sm italic"
                  >
                    No command logs found for this instance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
