import React from "react";

export interface DataPreviewPanelProps {
  visible: boolean;
  data: {
    fileName?: string;
    totalRecords?: number;
    total_records?: number;
    headers?: string[];
    schema?: Record<string, any>[];
  };
  onClose: () => void;
  onConfirm: () => void;
}

export function DataPreviewPanel({
  visible,
  data,
  onClose,
  onConfirm,
}: DataPreviewPanelProps) {
  if (!visible) return null;

  const totalCount = data?.totalRecords ?? data?.total_records ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl space-y-6">
      {/* Header with Total Count Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            Data Preview
          </h3>
          <p className="text-[11px] text-slate-500">
            {data.fileName || "Input List"}
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-right">
          <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
            Count
          </p>
          <p className="text-sm font-black text-indigo-600 font-mono">
            {totalCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table Preview */}
      <div className="overflow-x-auto max-h-[300px] border border-slate-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              {data.headers?.map((header: string) => (
                <th
                  key={header}
                  className="px-4 py-2 font-bold text-slate-600 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {data.schema?.map((row: Record<string, any>, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50">
                {Object.values(row).map((val: any, j: number) => (
                  <td key={j} className="px-4 py-2 text-slate-700">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] text-slate-400 italic">
          Showing preview of top {data.schema?.length || 0} rows
        </span>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Confirm & Proceed
        </button>
      </div>
    </div>
  );
}
