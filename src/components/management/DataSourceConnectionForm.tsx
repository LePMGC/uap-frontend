import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  type: string;
  settings: any;
  onChange: (settings: any) => void;
}

export function DataSourceConnectionForm({
  type,
  settings = {},
  onChange,
}: Props) {
  const [showPass, setShowPass] = useState(false);

  // Ensure default values are set for specific types when they are first selected
  useEffect(() => {
    if (type === "database" && !settings.driver) {
      updateField("driver", "mysql");
    }
    if (type === "sftp" && !settings.port) {
      updateField("port", 22);
    }
  }, [type]);

  const updateField = (field: string, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const updateNestedField = (parent: string, key: string, value: any) => {
    const parentObj = settings[parent] || {};
    onChange({
      ...settings,
      [parent]: { ...parentObj, [key]: value },
    });
  };

  const removeNestedField = (parent: string, key: string) => {
    const parentObj = { ...settings[parent] };
    delete parentObj[key];
    onChange({ ...settings, [parent]: parentObj });
  };

  const renderKeyValueEditor = (title: string, parentKey: string) => {
    const items = settings[parentKey] || {};
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </label>
          <button
            type="button"
            onClick={() =>
              updateNestedField(parentKey, "new_key_" + Date.now(), "")
            }
            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Item
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {Object.entries(items).map(([k, v], idx) => (
            <div
              key={idx}
              className="flex gap-2 animate-in fade-in slide-in-from-left-1"
            >
              <input
                placeholder="Key"
                value={k}
                onChange={(e) => {
                  const val = items[k];
                  const newKey = e.target.value;
                  const newObj = { ...items };
                  delete newObj[k];
                  newObj[newKey] = val;
                  onChange({ ...settings, [parentKey]: newObj });
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 outline-none"
              />
              <input
                placeholder="Value"
                value={v as string}
                onChange={(e) =>
                  updateNestedField(parentKey, k, e.target.value)
                }
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => removeNestedField(parentKey, k)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- API View ---
  if (type === "api") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Endpoint URL
            </label>
            <input
              value={settings.endpoint || ""}
              onChange={(e) => updateField("endpoint", e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              placeholder="https://api.company.com/v1/stock"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Data Path
            </label>
            <input
              value={settings.data_path || ""}
              onChange={(e) => updateField("data_path", e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              placeholder="data.items"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
          {renderKeyValueEditor("HTTP Headers", "headers")}
          {renderKeyValueEditor("Query Parameters", "query")}
        </div>
      </div>
    );
  }

  // --- DATABASE View ---
  if (type === "database") {
    return (
      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
        <div className="col-span-2 md:col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Driver
          </label>
          <select
            value={settings.driver || "mysql"}
            onChange={(e) => updateField("driver", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold appearance-none focus:bg-white focus:border-indigo-500 transition-all outline-none"
          >
            <option value="mysql">MySQL</option>
            <option value="pgsql">PostgreSQL</option>
            <option value="sqlsrv">SQL Server (MSSQL)</option>
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
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white transition-all outline-none"
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
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Target Table
          </label>
          <input
            value={settings.table || ""}
            onChange={(e) => updateField("table", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
            placeholder="e.g. users"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Username
          </label>
          <input
            value={settings.username || ""}
            onChange={(e) => updateField("username", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={settings.password || ""}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono pr-10 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
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

  // --- SFTP View (Sample ID 1) ---
  if (type === "sftp") {
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
        <div>
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
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Root Directory
          </label>
          <input
            value={settings.root || ""}
            onChange={(e) => updateField("root", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
            placeholder="/home/ubuntu"
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Target File Path
          </label>
          <input
            value={settings.file_path || ""}
            onChange={(e) => updateField("file_path", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            placeholder="/home/ubuntu/data.csv"
          />
        </div>
      </div>
    );
  }

  // --- UPLOAD View (Sample ID 4) ---
  if (type === "upload") {
    return (
      <div className="animate-in fade-in slide-in-from-top-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          File Storage Path
        </label>
        <input
          value={settings.file_path || ""}
          onChange={(e) => updateField("file_path", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
          placeholder="uploads/customer_list_feb15.csv"
        />
        <p className="mt-3 text-[11px] text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200">
          <b>Note:</b> For manual uploads, ensure the file is physically present
          in the storage directory defined above on the server.
        </p>
      </div>
    );
  }

  // --- EMPTY State ---
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
        <Plus className="h-5 w-5 text-slate-300" />
      </div>
      <p className="text-slate-400 text-sm font-medium">
        Select a source type to begin configuration
      </p>
    </div>
  );
}
