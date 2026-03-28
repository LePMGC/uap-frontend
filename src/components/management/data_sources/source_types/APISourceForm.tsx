import { Plus, Trash2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, type JSX } from "react";

interface APIProps {
  settings: any;
  updateField: (field: string, value: any) => void;
  renderKeyValueEditor: (title: string, parentKey: string) => JSX.Element;
}

type AuthMethod = "none" | "bearer" | "basic" | "api_key";

export function APISourceForm({
  settings,
  updateField,
  renderKeyValueEditor,
}: APIProps) {
  const [showPass, setShowPass] = useState(false);

  const handleAuthMethodChange = (method: AuthMethod) => {
    // Reset auth data when switching methods to avoid mixing credentials
    updateField("auth", { method, data: {} });
  };

  const updateAuthData = (key: string, value: string) => {
    updateField("auth", {
      ...settings.auth,
      data: { ...settings.auth?.data, [key]: value },
    });
  };

  const currentAuthMethod: AuthMethod = settings.auth?.method || "none";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
      {/* 1. ENDPOINT CONFIGURATION */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Endpoint URL
          </label>
          <input
            value={settings.endpoint || ""}
            onChange={(e) => updateField("endpoint", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all"
            placeholder="https://api.company.com/v1/data"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Data JSON Path
          </label>
          <input
            value={settings.data_path || ""}
            onChange={(e) => updateField("data_path", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
            placeholder="data.items"
          />
        </div>
      </div>

      {/* 2. AUTHENTICATION SECTION */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-3.5 w-3.5 text-indigo-500" />
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Authentication
          </label>
        </div>

        <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
          {(["none", "api_key", "bearer", "basic"] as AuthMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleAuthMethodChange(m)}
              className={`py-2 text-[10px] font-bold rounded-lg transition-all capitalize ${
                currentAuthMethod === m
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Dynamic Auth Fields */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 border-dashed">
          {currentAuthMethod === "none" && (
            <p className="text-[11px] text-slate-400 text-center italic">
              This request will be sent without authentication headers.
            </p>
          )}

          {currentAuthMethod === "api_key" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500">
                  Key Name
                </label>
                <input
                  placeholder="e.g. X-API-Key"
                  value={settings.auth?.data?.key || ""}
                  onChange={(e) => updateAuthData("key", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">
                  Value
                </label>
                <input
                  type="password"
                  placeholder="Your API Key"
                  value={settings.auth?.data?.value || ""}
                  onChange={(e) => updateAuthData("value", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
          )}

          {currentAuthMethod === "bearer" && (
            <div>
              <label className="text-[10px] font-bold text-slate-500">
                Bearer Token
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={settings.auth?.data?.token || ""}
                  onChange={(e) => updateAuthData("token", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono pr-10 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPass ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {currentAuthMethod === "basic" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500">
                  Username
                </label>
                <input
                  value={settings.auth?.data?.username || ""}
                  onChange={(e) => updateAuthData("username", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  value={settings.auth?.data?.password || ""}
                  onChange={(e) => updateAuthData("password", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ADDITIONAL PARAMETERS */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
        {renderKeyValueEditor("HTTP Headers", "headers")}
        {renderKeyValueEditor("Query Parameters", "query")}
      </div>
    </div>
  );
}
