import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface DBProps {
  settings: any;
  updateField: (field: string, value: any) => void;
}

export function DatabaseSourceForm({ settings, updateField }: DBProps) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="col-span-2 md:col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Driver
        </label>
        <select
          value={settings.driver || "mysql"}
          onChange={(e) => updateField("driver", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold appearance-none outline-none"
        >
          <option value="mysql">MySQL</option>
          <option value="pgsql">PostgreSQL</option>
          <option value="sqlsrv">SQL Server</option>
          <option value="sqlite">SQLite</option>
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Host / IP
        </label>
        <input
          value={settings.host || ""}
          onChange={(e) => updateField("host", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          placeholder="localhost"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Database Name
        </label>
        <input
          value={settings.database || ""}
          onChange={(e) => updateField("database", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Target Table
        </label>
        <input
          value={settings.table || ""}
          onChange={(e) => updateField("table", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          placeholder="users"
        />
      </div>
      <div>
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
    </div>
  );
}
