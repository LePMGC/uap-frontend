import { FolderOpen, Search } from "lucide-react";

export function SFTPSource({ data, updateData, onPreview }: any) {
  const config = data.source_config || {};

  const setConfig = (newVal: any) => {
    updateData({ source_config: { ...config, ...newVal } });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            SFTP Connection
          </label>
          <select
            value={data.source_id}
            onChange={(e) => updateData({ source_id: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
          >
            <option value="">Select a saved server...</option>
            <option value="sftp_1">Main Archive Server (10.0.0.5)</option>
            <option value="sftp_2">External Vendor SFTP</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            File Pattern
          </label>
          <input
            type="text"
            placeholder="e.g. users_*.csv"
            value={config.pattern || ""}
            onChange={(e) => setConfig({ pattern: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Directory Path
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="/home/batches/exports/"
            value={config.path || ""}
            onChange={(e) => setConfig({ path: e.target.value })}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none"
          />
          <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onPreview}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Scan Directory & Preview
        </button>
      </div>
    </div>
  );
}
