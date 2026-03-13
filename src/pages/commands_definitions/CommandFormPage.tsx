// src/pages/management/commands/CommandFormPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Save,
  Layout,
  Code2,
  Settings2,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { commandService } from "@/services/commandService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { ParameterTree } from "@/components/management/ParameterTree";
import { parseUcipXml } from "@/utils/payloadParsers";
import { ProtocolEditor } from "@/components/management/ProtocolEditor";

export default function CommandFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<"code" | "visual">("code");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // New state for category metadata (to get actions)
  const [categoryData, setCategoryData] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    name: "",
    command_key: "",
    action: "view",
    description: "",
    category_slug: searchParams.get("category") || "",
    request_payload: "",
    system_params: {},
  });

  const visualizedParameters = useMemo(() => {
    return parseUcipXml(formData.request_payload);
  }, [formData.request_payload]);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        // 1. Fetch Command if Editing
        if (id) {
          const data = await commandService.getOneCommand(id);
          setFormData(data);
          // Fetch category based on loaded command
          fetchCategoryDetails(data.category_slug);
        } else {
          // Fetch category based on URL param for new command
          const catSlug = searchParams.get("category");
          if (catSlug) fetchCategoryDetails(catSlug);
          setLoading(false);
        }
      } catch (error) {
        showToast("Initialization failed", "error");
      }
    };

    initPage();
  }, [id]);

  const fetchCategoryDetails = async (slug: string) => {
    try {
      const cats = await commandService.getCategories();
      const currentCat = cats.find((c: any) => c.slug === slug);
      setCategoryData(currentCat);
    } catch (e) {
      console.error("Failed to load category metadata");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Display name is required";
    if (!formData.command_key?.trim())
      newErrors.command_key = "Protocol key is required";
    if (!formData.action?.trim()) newErrors.action = "Action is required";
    if (!formData.request_payload?.trim())
      newErrors.request_payload = "Payload cannot be empty";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast("Please fill in all mandatory fields", "error");
      return;
    }

    setSaving(true);
    try {
      if (id) {
        await commandService.updateCommand(id, formData);
        showToast("Command updated successfully", "success");
      } else {
        await commandService.createCommand(formData);
        showToast("Command created successfully", "success");
      }
      navigate(-1);
    } catch (error) {
      showToast("Error saving changes", "error");
    } finally {
      setSaving(false);
    }
  };

  function getCategoryFormat(category_slug: string): "xml" | "mml" | "binary" {
    if (category_slug?.includes("ucip")) return "xml";
    if (category_slug?.includes("mml")) return "mml";
    return "binary";
  }

  if (loading)
    return (
      <div className="p-8 animate-pulse text-slate-400">
        Loading Configuration...
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-slate-50/50">
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
            title="Back to list"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition-all",
            saving
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-indigo-700 active:scale-95",
          )}
        >
          {saving ? (
            <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <section className="w-[35%] border-r border-slate-200 bg-white overflow-y-auto p-6 flex flex-col gap-6">
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" /> Identity & Metadata
            </h2>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex justify-between">
                  Command Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={cn(
                    "w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none transition-all",
                    errors.name
                      ? "border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-indigo-500/10",
                  )}
                />
              </div>

              {/* Protocol Key Field */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex justify-between">
                  Protocol Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.command_key || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, command_key: e.target.value })
                  }
                  className={cn(
                    "w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono outline-none transition-all",
                    errors.command_key
                      ? "border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-indigo-500/10",
                  )}
                />
              </div>

              {/* Action Select Field */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex justify-between">
                  Command Action <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <select
                    value={formData.action || "view"}
                    onChange={(e) =>
                      setFormData({ ...formData, action: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                  >
                    {categoryData?.command_actions ? (
                      categoryData.command_actions.map((act: string) => (
                        <option key={act} value={act}>
                          {act.toUpperCase()}
                        </option>
                      ))
                    ) : (
                      <option value={formData.action}>
                        {formData.action.toUpperCase()}
                      </option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[80px] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Injection Variables */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Injection Variables
            </h2>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
              {Object.entries(formData.system_params || {}).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="font-mono text-slate-500">{key}</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {String(value)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveView("code")}
                className={cn(
                  "flex items-center gap-2 text-[11px] font-bold uppercase transition-all border-b-2 h-12",
                  activeView === "code"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400",
                )}
              >
                <Code2 className="h-3.5 w-3.5" /> Payload Editor
              </button>
              <button
                onClick={() => setActiveView("visual")}
                className={cn(
                  "flex items-center gap-2 text-[11px] font-bold uppercase transition-all border-b-2 h-12",
                  activeView === "visual"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400",
                )}
              >
                <Layout className="h-3.5 w-3.5" /> Parameter Architect
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            {activeView === "code" ? (
              <div
                className={cn(
                  "h-[calc(100vh-200px)] rounded-xl overflow-hidden border-2 transition-all",
                  errors.request_payload
                    ? "border-red-500/50"
                    : "border-transparent",
                )}
              >
                <ProtocolEditor
                  template={formData.request_payload || ""}
                  language={getCategoryFormat(formData.category_slug)}
                  onChange={(val: any) =>
                    setFormData({ ...formData, request_payload: val })
                  }
                />
              </div>
            ) : (
              <ParameterTree
                parameters={visualizedParameters}
                onChange={() => {}}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
