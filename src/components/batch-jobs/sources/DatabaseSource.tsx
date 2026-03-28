import { useState, useEffect } from "react";
import {
  Database,
  Table,
  Code2,
  ChevronDown,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DatabaseSource({ data, updateData, onPreview }: any) {
  // 1. Local state for the toggle mode (defaults to 'table' if not set)
  const [mode, setMode] = useState<"table" | "query">(
    data.source_config?.mode || "table",
  );

  // Mocked connections - in production, these come from your Laravel API
  const savedConnections = [
    { id: "1", name: "Production Read-Only", driver: "postgresql" },
    { id: "2", name: "Analytics Data Warehouse", driver: "mysql" },
  ];

  // Helper to update config while preserving other fields
  const updateConfig = (newFields: any) => {
    updateData({
      source_config: { ...data.source_config, ...newFields, mode },
    });
  };

  // Sync mode to global data whenever it changes
  useEffect(() => {
    updateConfig({ mode });
  }, [mode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* SECTION 1: CONNECTION SELECTION */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          1. Select Database Connection
        </label>
        <div className="relative">
          <select
            className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            value={data.source_id || ""}
            onChange={(e) => updateData({ source_id: e.target.value })}
          >
            <option value="">Choose a saved database...</option>
            {savedConnections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({conn.driver})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {data.source_id ? (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-400">
          {/* SECTION 2: MODE SWITCHER */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              2. Data Selection Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("table")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                  mode === "table"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Table className="h-3.5 w-3.5" />
                Select Table
              </button>
              <button
                type="button"
                onClick={() => setMode("query")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                  mode === "query"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                SQL Query
              </button>
            </div>
          </div>

          {/* SECTION 3: DYNAMIC FORM */}
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4">
            {mode === "table" ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase">
                  Table Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. users, transactions, orders..."
                    value={data.source_config?.table || ""}
                    onChange={(e) => updateConfig({ table: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Note: This will fetch all columns from the specified table.
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase">
                    Custom SQL Statement
                  </label>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
                    Advanced
                  </span>
                </div>
                <textarea
                  value={data.source_config?.query || ""}
                  onChange={(e) => updateConfig({ query: e.target.value })}
                  placeholder="SELECT u.id, u.email, p.amount FROM users u JOIN payments p ON u.id = p.user_id WHERE p.status = 'paid'..."
                  className="w-full h-40 p-4 rounded-2xl border border-slate-200 font-mono text-[11px] leading-relaxed focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                />
              </div>
            )}

            {/* PREVIEW ACTION */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onPreview}
                className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
              >
                Test & Fetch Data
                <Database className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
            <Database className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Select a connection to configure source
          </p>
        </div>
      )}
    </div>
  );
}
