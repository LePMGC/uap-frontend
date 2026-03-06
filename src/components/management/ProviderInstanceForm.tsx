// src/components/management/ProviderInstanceForm.tsx
import { Eye, EyeOff, Server } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  category: string; // This is the category_slug (e.g., 'ericsson-ucip')
  settings: any;
  onChange: (settings: any) => void;
}

export function ProviderInstanceForm({
  category,
  settings = {},
  onChange,
}: Props) {
  const [showPass, setShowPass] = useState(false);

  // Set default port values based on category when selected
  useEffect(() => {
    if (!settings.port) {
      if (category === "ericsson-ucip") updateField("port", 10011);
      if (category === "ericsson-cai") updateField("port", 3300);
    }
  }, [category]);

  const updateField = (field: string, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  /**
   * Common fields for Network Elements (Host, Port, User, Pass)
   */
  const renderNetworkFields = () => (
    <>
      <div className="col-span-2 md:col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Host / IP Address
        </label>
        <input
          value={settings.host || ""}
          onChange={(e) => updateField("host", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white outline-none transition-all"
          placeholder="51.195.136.239"
        />
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Port
        </label>
        <input
          type="number"
          value={settings.port || ""}
          onChange={(e) => updateField("port", e.target.value)}
          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white outline-none"
          placeholder="e.g. 3300"
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
    </>
  );

  // --- Ericsson UCIP & CAI View ---
  if (category === "ericsson-ucip" || category === "ericsson-cai") {
    return (
      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
        {renderNetworkFields()}
        {category === "ericsson-ucip" && (
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              User Agent / Client ID
            </label>
            <input
              value={settings.user_agent || ""}
              onChange={(e) => updateField("user_agent", e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none"
              placeholder="e.g. EDA-Provisioning-Client or UGw Server/5.0/1.0"
            />
          </div>
        )}
      </div>
    );
  }

  // --- LEAP (REST API Based) View ---
  if (category === "leap") {
    return (
      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            API Base Endpoint
          </label>
          <input
            value={settings.host || ""}
            onChange={(e) => updateField("host", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none"
            placeholder="https://leap-service.internal/api/v1"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Auth Token / Secret
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={settings.password || ""}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none"
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

  // --- SMSC (SMPP) View ---
  if (category === "smsc") {
    return (
      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
        {renderNetworkFields()}
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            System Type
          </label>
          <input
            value={settings.system_type || ""}
            onChange={(e) => updateField("system_type", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
            placeholder="SMPP"
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Address Range
          </label>
          <input
            value={settings.address_range || ""}
            onChange={(e) => updateField("address_range", e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
            placeholder="e.g. 1234"
          />
        </div>
      </div>
    );
  }

  // --- Empty State ---
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
      <div className="bg-white p-3 rounded-full shadow-sm mb-3">
        <Server className="h-6 w-6 text-slate-300" />
      </div>
      <p className="text-slate-400 text-sm font-medium">
        Select a provider category to configure parameters
      </p>
    </div>
  );
}
