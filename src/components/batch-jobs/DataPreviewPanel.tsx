import { X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  visible: boolean;
  data?: any; // Expecting { fileName: string, schema: any[] }
  onClose: () => void;
}

export function DataPreviewPanel({ visible, data, onClose }: Props) {
  if (!visible || !data) return null;

  // Use the schema array from our data object for the preview rows
  const rows = data.schema || [];

  // Extract headers from the first row of data
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="w-full shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
        {/* 🟢 PANEL HEADER (With X Close Button) */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
              Schema Preview
            </h4>
            <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" />
              Detected
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 🟢 INFO SECTION */}
        <div className="px-5 py-4 bg-white">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Valid format. Previewing first {rows.length} rows of
            <span className="text-slate-900 font-bold ml-1">
              `{data.fileName || "source_file"}`
            </span>
            .
          </p>
        </div>

        {/* 🟢 MINI PREVIEW TABLE (Using Table Semantics) */}
        <div className="px-5 pb-2">
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {headers.map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter border-r last:border-r-0 border-slate-100"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.slice(0, 5).map((row: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {Object.values(row).map((val: any, j: number) => (
                        <td
                          key={j}
                          className="px-3 py-2 text-[11px] text-slate-600 font-medium border-r last:border-r-0 border-slate-50 truncate max-w-[120px]"
                        >
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🟢 PANEL FOOTER ACTION */}
        <div className="p-5 mt-auto">
          <button
            onClick={onClose} // Triggers the same close action as the X button for now
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Definition
          </button>
        </div>
      </div>
    </div>
  );
}
