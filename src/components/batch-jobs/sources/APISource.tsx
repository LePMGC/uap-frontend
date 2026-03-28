import { Globe, Plus, Link as LinkIcon } from "lucide-react";

export function APISource({ data, updateData, onPreview }: any) {
  const savedApis = [
    { id: "api_1", name: "Core Banking API", baseUrl: "https://api.bank.com" },
    { id: "api_2", name: "ERP Integration", baseUrl: "https://erp.local" },
  ];

  const config = data.source_config || {
    endpoint: "",
    method: "GET",
    data_path: "",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          1. Select API Service
        </label>
        <select
          value={data.source_id || ""}
          onChange={(e) => updateData({ source_id: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none"
        >
          <option value="">Choose an API service...</option>
          {savedApis.map((api) => (
            <option key={api.id} value={api.id}>
              {api.name} ({api.baseUrl})
            </option>
          ))}
        </select>
      </div>

      {data.source_id && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
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
            <div className="col-span-3 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Relative Endpoint
              </label>
              <div className="relative">
                <input
                  placeholder="/v1/users/export"
                  value={config.endpoint}
                  onChange={(e) =>
                    updateData({
                      source_config: { ...config, endpoint: e.target.value },
                    })
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none"
                />
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">
              JSON Data Path
            </label>
            <input
              placeholder="data.records"
              value={config.data_path}
              onChange={(e) =>
                updateData({
                  source_config: { ...config, data_path: e.target.value },
                })
              }
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-mono outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onPreview}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700"
            >
              Test & Preview API
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
