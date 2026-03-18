import { useState, useEffect } from "react";
import {
  RotateCcw,
  Copy,
  Braces,
  FormInput,
  Loader2,
  CheckCircle2,
  Terminal,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { commandService } from "@/services/commandService";
import { ProtocolEditor } from "../management/ProtocolEditor";

interface BuilderPanelProps {
  selectedCommandSummary: any;
}

export default function BuilderPanel({
  selectedCommandSummary,
}: BuilderPanelProps) {
  const [activeTab, setActiveTab] = useState<"form" | "raw">("form");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [previewPayload, setPreviewPayload] = useState("");

  // 1. Fetch Full Details - Now with State Reset logic
  useEffect(() => {
    if (!selectedCommandSummary?.id) return;

    const fetchFullDetails = async () => {
      // RESET: Clear old data immediately to prevent "ghosting" while loading
      setDetails(null);
      setFormValues({});
      setPreviewPayload("");

      setLoading(true);
      try {
        const data = await commandService.getOneCommand(
          selectedCommandSummary.id,
        );

        setDetails(data);
        // Ensure formValues is at least an empty object if no parameters exist
        setFormValues(data.parameters || {});

        // Initialize preview payload with the raw template from BE
        setPreviewPayload(data.request_payload || "");
      } catch (err) {
        console.error("Failed to fetch command details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [selectedCommandSummary?.id]);

  // 2. Sync Form with Raw Payload
  useEffect(() => {
    if (details?.request_payload) {
      let preview = details.request_payload;
      const flatValues = flattenObject(formValues);

      Object.entries(flatValues).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        preview = preview.replace(
          regex,
          value !== undefined && value !== null
            ? value.toString()
            : `{{ ${key} }}`,
        );
      });
      setPreviewPayload(preview);
    }
  }, [formValues, details]);

  // --- UTILS ---
  function flattenObject(obj: any, prefix = "") {
    if (!obj) return {};
    return Object.keys(obj).reduce((acc: any, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (
        typeof obj[k] === "object" &&
        obj[k] !== null &&
        !Array.isArray(obj[k])
      ) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else if (Array.isArray(obj[k])) {
        obj[k].forEach((item: any, i: number) => {
          Object.assign(acc, flattenObject(item, `${pre}${k}.${i}`));
        });
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  }

  const handleValueChange = (path: string, value: any) => {
    setFormValues((prev: any) => {
      const newValues = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newValues;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const originalType = typeof current[lastKey];
      current[lastKey] = originalType === "number" ? Number(value) : value;

      return newValues;
    });
  };

  const getNestedValue = (obj: any, path: string) => {
    if (!obj) return undefined;
    return path.split(".").reduce((prev, curr) => prev?.[curr], obj);
  };

  // --- RECURSIVE RENDERER ---
  const renderField = (key: string, value: any, path: string) => {
    const currentPath = path ? `${path}.${key}` : key;

    if (Array.isArray(value)) {
      return (
        <div key={currentPath} className="col-span-full space-y-4 my-4">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-3 w-3 text-indigo-500" />
            <span className="text-[12px] font-bold text-slate-500">{key}</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          {value.map((item, index) => (
            <div
              key={`${currentPath}.${index}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200 relative"
            >
              <span className="absolute -top-2 -left-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                {index + 1}
              </span>
              {Object.entries(item).map(([childK, childV]) =>
                renderField(childK, childV, `${currentPath}.${index}`),
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div
          key={currentPath}
          className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50/30"
        >
          <div className="col-span-full text-[11px] font-bold text-slate-400">
            {key}
          </div>
          {Object.entries(value).map(([childK, childV]) =>
            renderField(childK, childV, currentPath),
          )}
        </div>
      );
    }

    return (
      <div key={currentPath} className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-700">{key}</label>
        <input
          type={typeof value === "number" ? "number" : "text"}
          value={getNestedValue(formValues, currentPath) ?? ""}
          onChange={(e) => handleValueChange(currentPath, e.target.value)}
          className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white border-r">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          Fetching Blueprint...
        </span>
      </div>
    );

  if (!details)
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-white border-r">
        <Terminal className="h-10 w-10 mb-4 opacity-20" />
        <p className="text-sm italic">
          Select a command to begin configuration
        </p>
      </div>
    );

  return (
    <section className="flex-1 flex flex-col bg-white border-r border-slate-200 overflow-hidden min-w-0">
      {/* Header Tabs */}
      <div className="h-12 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between px-6 shrink-0">
        <div className="flex gap-6 h-full items-center">
          <button
            onClick={() => setActiveTab("form")}
            className={cn(
              "flex items-center gap-2 text-[11px] font-bold h-full uppercase tracking-widest border-b-2 transition-all",
              activeTab === "form"
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-400 border-transparent hover:text-slate-600",
            )}
          >
            <FormInput className="h-3.5 w-3.5" /> Form View
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={cn(
              "flex items-center gap-2 text-[11px] font-bold h-full uppercase tracking-widest border-b-2 transition-all",
              activeTab === "raw"
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-400 border-transparent hover:text-slate-600",
            )}
          >
            <Braces className="h-3.5 w-3.5" /> Raw Payload
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "form" ? (
          <div className="h-full overflow-y-auto p-8 custom-scrollbar">
            {Object.keys(details.parameters || {}).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-5xl">
                {Object.entries(details.parameters).map(([k, v]) =>
                  renderField(k, v, ""),
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                <Terminal className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">
                  This command has no configurable parameters.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full bg-[#1e1e1e]">
            <ProtocolEditor
              template={previewPayload}
              language={details.format || "xml"}
              onChange={(val: any) => setPreviewPayload(val || "")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
