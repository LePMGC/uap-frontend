import { useState, useEffect } from "react";
import {
  Server,
  Terminal,
  Upload,
  Database,
  Globe,
  ChevronDown,
} from "lucide-react";
import { providerInstanceService } from "@/services/providerInstanceService";
import { commandService } from "@/services/commandService";
import { cn } from "@/lib/utils";
import { CommandSelect } from "@/components/batch-jobs/CommandSelect";
import { DataPreviewPanel } from "@/components/batch-jobs/DataPreviewPanel";
import { APISource } from "@/components/batch-jobs/sources/APISource";
import { DatabaseSource } from "@/components/batch-jobs/sources/DatabaseSource";
import { FileUploadSource } from "@/components/batch-jobs/sources/FileUploadSource";
import { SFTPSource } from "@/components/batch-jobs/sources/SFTPSource";

interface Step1Props {
  data: any;
  updateData: (newData: Partial<any>) => void;
  onConfirm: () => void;
}

export function Step1BasicInfo({ data, updateData, onConfirm }: Step1Props) {
  const [instances, setInstances] = useState<any[]>([]);
  const [commands, setCommands] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    instances: false,
    commands: false,
  });

  /* ---------------- MAPPING STRATEGIES ---------------- */
  const SourceComponents: Record<string, any> = {
    upload: FileUploadSource,
    database: DatabaseSource,
    sftp: SFTPSource,
    api: APISource,
  };

  const SelectedSourceUI = SourceComponents[data.source_type];

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    const fetchInstances = async () => {
      setLoading((prev) => ({ ...prev, instances: true }));
      try {
        const res = await providerInstanceService.getAll();
        setInstances(res.data || []);
      } finally {
        setLoading((prev) => ({ ...prev, instances: false }));
      }
    };
    fetchInstances();
  }, []);

  useEffect(() => {
    if (!data.provider_instance_id) {
      setCommands([]);
      return;
    }
    const fetchCommands = async () => {
      setLoading((prev) => ({ ...prev, commands: true }));
      try {
        const instance = instances.find(
          (i) => i.id.toString() === data.provider_instance_id.toString(),
        );
        if (instance?.category_slug) {
          const res = await commandService.getCommandsByCategory(
            instance.category_slug,
          );
          setCommands(res || []);
        }
      } finally {
        setLoading((prev) => ({ ...prev, commands: false }));
      }
    };
    fetchCommands();
  }, [data.provider_instance_id, instances]);

  /* ---------------- HANDLERS ---------------- */

  const handleTriggerPreview = () => {
    // Mocking the detection process
    const mockPreviewData = {
      fileName:
        data.source_type === "upload" ? "users_export.csv" : "Query_Result_01",
      detectedRows: 3,
      schema: [
        { id: "101", status: "Active", last_sync: "2026-03-20" },
        { id: "102", status: "Pending", last_sync: "2026-03-21" },
        { id: "103", status: "Active", last_sync: "2026-03-22" },
      ],
    };
    updateData({ preview: mockPreviewData });
  };

  const handleClosePreview = () => {
    updateData({ preview: null });
  };

  // Define visibility for the grid and the panel
  const showPreview = !!data.preview;

  const sourceTypes = [
    {
      id: "upload",
      label: "File Upload",
      icon: Upload,
      desc: "CSV or Excel file",
    },
    {
      id: "database",
      label: "Database",
      icon: Database,
      desc: "Direct SQL query",
    },
    {
      id: "sftp",
      label: "SFTP Server",
      icon: Server,
      desc: "Remote file fetch",
    },
    {
      id: "api",
      label: "API Call",
      icon: Globe,
      desc: "External REST endpoint",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-10 transition-all duration-500 ease-in-out items-start",
        showPreview
          ? "grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]"
          : "grid-cols-1",
      )}
    >
      {/* LEFT SIDE: CONFIGURATION */}
      <div className="space-y-10 min-w-0">
        {/* SECTION 1: CORE DETAILS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Batch Job Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Provider Instance
            </label>
            <div className="relative">
              <select
                value={data.provider_instance_id}
                onChange={(e) =>
                  updateData({
                    provider_instance_id: e.target.value,
                    command_id: "",
                  })
                }
                className="w-full h-12 px-10 rounded-2xl border border-slate-200 appearance-none bg-white font-medium outline-none"
              >
                <option value="">Select an instance...</option>
                {instances.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              <Server className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Command
            </label>
            <div className="relative">
              <CommandSelect
                commands={commands}
                value={data.command_id}
                onChange={(val: any) => updateData({ command_id: val })}
                disabled={!data.provider_instance_id || loading.commands}
              />
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* SECTION 2: DATA SOURCE STRATEGY */}
        <section className="space-y-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Data Source Configuration
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Select the ingestion method and configure connection details.
            </p>
          </div>

          {/* Source Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  handleClosePreview(); // Reset preview when switching types
                  updateData({ source_type: type.id, source_config: {} });
                }}
                className={cn(
                  "p-3 rounded-2xl border-2 text-left transition-all duration-300 group flex items-center gap-4",
                  data.source_type === type.id
                    ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-500/5"
                    : "border-slate-100 bg-white hover:border-slate-200",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    data.source_type === type.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  <type.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-bold text-[13px] leading-tight",
                      data.source_type === type.id
                        ? "text-indigo-900"
                        : "text-slate-700",
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {type.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Dynamic Strategy UI */}
          <div className="p-8 bg-slate-50/50 border border-slate-200 rounded-[2.5rem] border-dashed transition-all">
            {SelectedSourceUI ? (
              <SelectedSourceUI
                data={data}
                updateData={updateData}
                onPreview={handleTriggerPreview}
              />
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs italic">
                Please select a source type to configure.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* RIGHT SIDE: PREVIEW PANEL */}
      {data.preview && (
        <aside className="sticky top-0 animate-in fade-in slide-in-from-right-10 duration-500 h-fit">
          <DataPreviewPanel
            visible={!!data.preview}
            data={data.preview}
            onClose={() => updateData({ preview: null })}
            onConfirm={onConfirm}
          />
        </aside>
      )}
    </div>
  );
}
