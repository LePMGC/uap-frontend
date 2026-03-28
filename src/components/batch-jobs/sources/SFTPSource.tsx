import { FolderOpen, HardDrive } from "lucide-react";

export function SFTPSource({ data, updateData, onPreview }: any) {
  const savedServers = [
    { id: "sftp_1", name: "Main Export Server", host: "10.0.0.5" },
    { id: "sftp_2", name: "Vendor Gateway", host: "sftp.vendor.com" },
  ];

  const config = data.source_config || { path: "", pattern: "" };

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          1. Select SFTP Server
        </label>
        <select
          value={data.source_id || ""}
          onChange={(e) => updateData({ source_id: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none"
        >
          <option value="">Choose a saved server...</option>
          {savedServers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.host})
            </option>
          ))}
        </select>
      </div>

      {data.source_id && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Directory Path
              </label>
              <div className="relative">
                <input
                  placeholder="/uploads/csv/"
                  value={config.path}
                  onChange={(e) =>
                    updateData({
                      source_config: { ...config, path: e.target.value },
                    })
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none"
                />
                <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                File Pattern
              </label>
              <input
                placeholder="users_*.csv"
                value={config.pattern}
                onChange={(e) =>
                  updateData({
                    source_config: { ...config, pattern: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onPreview}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Scan For Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
