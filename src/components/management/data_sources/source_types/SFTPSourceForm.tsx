import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function SFTPSourceForm({ settings, updateField }: any) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Host
        </label>
        <input
          value={settings.host || ""}
          onChange={(e) => updateField("host", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Port
        </label>
        <input
          type="number"
          value={settings.port || 22}
          onChange={(e) => updateField("port", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div className="col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Username
        </label>
        <input
          value={settings.username || ""}
          onChange={(e) => updateField("username", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div className="relative">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Password
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={settings.password || ""}
            onChange={(e) => updateField("password", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="col-span-full">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Target File Path
        </label>
        <input
          value={settings.file_path || ""}
          onChange={(e) => updateField("file_path", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          placeholder="/home/user/exports/data.csv"
        />
      </div>
    </div>
  );
}
