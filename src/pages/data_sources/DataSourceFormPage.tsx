// src/pages/management/DataSourceFormPage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Send } from "lucide-react";
import { dataSourceService } from "@/services/dataSourceService";
import { useToastStore } from "@/hooks/useToastStore";
import { DataSourceConnectionForm } from "@/components/management/DataSourceConnectionForm";

export default function DataSourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "create");
  const { showToast } = useToastStore();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      dataSourceService.getById(id!).then((data) => {
        setName(data.name);
        setType(data.type);
        setSettings(data.connection_settings);
        setIsActive(data.is_active);
      });
    }
  }, [id, isEdit]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await dataSourceService.testConnection({
        type,
        connection_settings: settings,
      });
      showToast("Connection successful!", "success");
    } catch (err) {
      showToast("Connection failed. Check settings.", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      name,
      type,
      is_active: isActive,
      connection_settings: settings,
    };
    try {
      if (isEdit) await dataSourceService.update(id!, payload);
      else await dataSourceService.create(payload);
      showToast("Data source saved", "success");
      navigate("/data-sources");
    } catch (err) {
      showToast("Error saving data source", "error");
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEdit ? "Edit Data Source" : "Create Data Source"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure how the system connects to your external data provider.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTestConnection}
            disabled={!type || isTesting}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {isTesting ? (
              "Testing..."
            ) : (
              <>
                <Send className="h-4 w-4" /> Test Connection
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Save className="h-4 w-4" />{" "}
            {isEdit ? "Update Source" : "Save Source"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              General Information
            </label>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Display Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                  placeholder="e.g. Production MySQL"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Source Type
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setSettings({});
                  }}
                  disabled={isEdit}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="">Select Type</option>
                  <option value="api">Rest API</option>
                  <option value="database">Database (SQL)</option>
                  <option value="sftp">SFTP Server</option>
                  <option value="upload">File Upload</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
              Connection Settings
            </label>
            <DataSourceConnectionForm
              type={type}
              settings={settings}
              onChange={setSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
