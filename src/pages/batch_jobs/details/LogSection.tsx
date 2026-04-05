import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { InstanceInfoCard } from "./InstanceInfoCard";

interface LogSectionProps {
  logs: any[];
  errors: any[];
  meta: any;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (limit: number) => void;
  onRetryFailed: () => void;
  onRetryByCode: (code: string) => void;
  onExportByCode: (code: string) => void;
  onExportAllErrors: () => void;
  onFilterChange: (status: string) => void;
  stats: any;
}

export const LogSection = ({
  logs,
  errors,
  meta,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
  onRetryFailed,
  onRetryByCode,
  onExportByCode,
  onExportAllErrors,
  onFilterChange,
  stats,
}: LogSectionProps) => {
  const [activeTab, setActiveTab] = useState("All");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onFilterChange(tab);
  };

  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-4 space-y-6">
        <InstanceInfoCard stats={stats} />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xs font-serif italic">
                !
              </div>
              Error Analysis
            </div>
            <button
              onClick={onExportAllErrors}
              className="text-[10px] uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold bg-indigo-50 px-2 py-1 rounded"
            >
              <FileDown className="w-3 h-3" /> Full Export
            </button>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-50 text-[10px] uppercase tracking-wider">
                  <th className="pb-2 font-bold">Error Code</th>
                  <th className="pb-2 font-bold text-right">Actions / Count</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 font-medium">
                {errors.length > 0 ? (
                  errors.map((err, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 last:border-0 group transition-colors hover:bg-slate-50/30"
                    >
                      <td className="py-3 uppercase tracking-tight text-red-600 font-bold">
                        {err.code}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-slate-900 font-bold mr-1">
                            {err.count}
                          </span>
                          <button
                            onClick={() => onExportByCode(err.code)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRetryByCode(err.code)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-8 text-center text-slate-400 font-normal italic"
                    >
                      No errors analyzed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-200">
            {["All", "Success", "Failed", "Pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                  activeTab === tab
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={onRetryFailed}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors"
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
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => {
                const isSuccess = log.result?.is_successful;
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
                    <td className="px-6 py-4 font-semibold text-slate-700 text-sm">
                      {log.command_info?.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.metadata?.identifier || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
                      {log.metadata?.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-slate-500">Show:</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="bg-white border rounded px-2 py-1"
            >
              {[5, 10, 25].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <span className="text-slate-400">
              Showing {meta?.from || 0}-{meta?.to || 0} of {meta?.total || 0}{" "}
              logs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 border rounded hover:bg-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2">
              Page {currentPage} of {meta?.last_page || 1}
            </span>
            <button
              disabled={currentPage === meta?.last_page}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 border rounded hover:bg-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
