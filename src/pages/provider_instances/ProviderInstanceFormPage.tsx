// src/pages/management/ProviderInstanceFormPage.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { providerInstanceService } from "@/services/providerInstanceService";
import { useToastStore } from "@/hooks/useToastStore";
import { ProviderInstanceForm } from "@/components/management/ProviderInstanceForm";

export default function ProviderInstanceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "create");
  const { showToast } = useToastStore();
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 1. Centralized Validation Logic
  const validateForm = () => {
    // Check top-level identity
    if (!name.trim()) {
      showToast("Instance Name is required", "error");
      return false;
    }
    if (!category) {
      showToast("Please select a Category", "error");
      return false;
    }

    // Check dynamic settings based on category
    const requiredFields = ["host", "port", "username", "password"];
    if (category === "ericsson-ucip") requiredFields.push("user_agent");

    for (const field of requiredFields) {
      if (!settings[field]) {
        showToast(`Field '${field.replace("_", " ")}' is mandatory`, "error");
        return false;
      }
    }

    return true;
  };

  const handleConnectivityCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate only if we are testing new/modified settings
    if (!isEdit || isDirty) {
      if (!validateForm()) return;
    }

    setIsTesting(true);
    try {
      let response;
      if (isEdit && !isDirty) {
        response = await providerInstanceService.ping(id!);
      } else {
        response = await providerInstanceService.testConnection({
          category_slug: category,
          connection_settings: settings,
        });
      }
      showToast(response.message || "Connectivity check passed", "success");
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast(
        `${errorData?.message || "Check failed"}. ${errorData?.error || ""}`,
        "error",
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name,
      category_slug: category,
      is_active: isActive,
      connection_settings: settings,
    };

    try {
      if (isEdit) await providerInstanceService.update(id!, payload);
      else await providerInstanceService.create(payload);
      showToast("Instance configuration saved", "success");
      navigate("/providers-instances");
    } catch (err) {
      showToast("Error saving instance", "error");
    }
  };

  useEffect(() => {
    if (isEdit) {
      providerInstanceService.getById(id!).then((data) => {
        setName(data.name);
        setCategory(data.category_slug);
        setSettings(data.connection_settings);
        setIsActive(data.is_active);
      });
    }
  }, [id, isEdit]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in">
      {/* Form wrapper handles "Enter" key and accessibility */}
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? "Edit Provider Instance" : "Configure New Instance"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage connection credentials and network parameters.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConnectivityCheck}
              disabled={!category || isTesting}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              {isTesting
                ? "Checking..."
                : isEdit && !isDirty
                  ? "Ping Instance"
                  : "Test Settings"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
            >
              <Save className="h-4 w-4" />{" "}
              {isEdit ? "Update Instance" : "Save Instance"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Identity & Category
              </label>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Instance Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white outline-none"
                    placeholder="e.g. Primary UCIP Node"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSettings({});
                      setIsDirty(true);
                    }}
                    className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold appearance-none cursor-pointer outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="ericsson-ucip">Ericsson UCIP</option>
                    <option value="ericsson-cai">Ericsson CAI</option>
                    <option value="leap">LEAP REST API</option>
                    <option value="smsc">SMSC (SMPP)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
                Connection Parameters
              </label>
              <ProviderInstanceForm
                category={category}
                settings={settings}
                onChange={(newVal) => {
                  setSettings(newVal);
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
