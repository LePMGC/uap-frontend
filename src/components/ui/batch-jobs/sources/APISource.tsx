import { Globe, Plus, Trash2 } from "lucide-react";

export function APISource({ data, updateData, onPreview }: any) {
  const config = data.source_config || { endpoint: "", method: "GET" };

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Method
          </label>
          <select
            value={config.method}
            onChange={(e) =>
              updateData({
                source_config: { ...config, method: e.target.value },
              })
            }
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none"
          >
            <option>GET</option>
            <option>POST</option>
          </select>
        </div>

        <div className="space-y-2 col-span-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Relative Endpoint
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="/api/v1/users/active"
              value={config.endpoint}
              onChange={(e) =>
                updateData({
                  source_config: { ...config, endpoint: e.target.value },
                })
              }
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none"
            />
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border border-slate-100 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[10px] font-black text-slate-700 uppercase">
            Query Parameters
          </h5>
          <button className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center py-4 text-[10px] text-slate-400 italic border border-dashed rounded-xl border-slate-200">
          No parameters defined.
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onPreview}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100"
        >
          Test API & Fetch Schema
        </button>
      </div>
    </div>
  );
}
