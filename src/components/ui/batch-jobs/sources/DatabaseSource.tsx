import { useState, useEffect } from "react";
import { Database, Search } from "lucide-react";

export function DatabaseSource({ data, updateData, onPreview }: any) {
  const [savedSources, setSavedSources] = useState([]);

  // Fetch pre-defined DB connections from backend
  useEffect(() => {
    // mock: dataSourceService.getByType('database')...
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">
            Select Connection
          </label>
          <select
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-white"
            value={data.source_id}
            onChange={(e) => updateData({ source_id: e.target.value })}
          >
            <option value="">Choose a saved database...</option>
            <option value="1">Production Read-Only (Postgres)</option>
            <option value="2">Analytics Data Warehouse (MySQL)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400">
          SQL Query / Table Name
        </label>
        <textarea
          value={data.source_config?.query}
          onChange={(e) =>
            updateData({
              source_config: { ...data.source_config, query: e.target.value },
            })
          }
          placeholder="SELECT * FROM transactions WHERE status = 'pending'..."
          className="w-full h-32 p-4 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-4 focus:ring-indigo-500/5 outline-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onPreview}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md"
        >
          Validate & Preview Query
        </button>
      </div>
    </div>
  );
}
