import { useState, useEffect } from "react";
import {
  FolderOpen,
  HardDrive,
  Loader2,
  ChevronDown,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dataSourceService } from "@/services/dataSourceService";
import { batchJobsService } from "@/services/batchJobsService";
import { useToastStore } from "@/hooks/useToastStore";

export function SFTPSource({ data, updateData }: any) {
  const { showToast } = useToastStore();
  const [servers, setServers] = useState<any[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // 1. Fetch available SFTP connections
  useEffect(() => {
    const fetchServers = async () => {
      setIsLoadingServers(true);
      try {
        const response = await dataSourceService.getAll(1, 999, {
          type: "sftp",
        });
        const fetchedData = response.data || response || [];
        setServers(fetchedData);
      } catch (error) {
        console.error("Failed to fetch SFTP sources:", error);
        showToast("Could not load SFTP servers", "error");
      } finally {
        setIsLoadingServers(false);
      }
    };
    fetchServers();
  }, []);

  const config = data.source_config || { path: "", pattern: "" };

  // 2. Trigger Discovery / Scan
  const handleScan = async () => {
    if (!data.source_id) {
      showToast("Please select an SFTP server", "error");
      return;
    }
    if (!config.path) {
      showToast("Please specify a directory path", "error");
      return;
    }

    setIsScanning(true);
    try {
      const payload = {
        data_source_id: data.source_id,
        source_config: config,
        number_of_rows: 10,
      };

      const response = await batchJobsService.discoverSchema(payload);

      // Update global wizard state
      updateData({
        preview: {
          fileName: `SFTP: ${config.pattern || "Latest file"}`,
          headers: response.headers,
          schema: response.preview, // For DataPreviewPanel
        },
      });

      showToast("File found and schema analyzed", "success");
    } catch (error: any) {
      console.error("SFTP Scan Error:", error);
      showToast(
        error.response?.data?.error ||
          "Failed to connect or find matching files.",
        "error",
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* SECTION 1: SERVER SELECTION */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          1. Select SFTP Server
        </label>
        <div className="relative">
          <select
            disabled={isLoadingServers}
            value={data.source_id || ""}
            onChange={(e) => updateData({ source_id: e.target.value })}
            className={cn(
              "w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none appearance-none transition-all",
              isLoadingServers && "opacity-50 cursor-not-allowed",
            )}
          >
            <option value="">
              {isLoadingServers
                ? "Loading servers..."
                : "Choose a saved server..."}
            </option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.connection_settings?.host})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoadingServers ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {data.source_id ? (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-400">
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Directory Path
                </label>
                <div className="relative">
                  <input
                    placeholder="/uploads/csv/daily/"
                    value={config.path}
                    onChange={(e) =>
                      updateData({
                        source_config: { ...config, path: e.target.value },
                      })
                    }
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                  />
                  <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  File Pattern (Optional)
                </label>
                <input
                  placeholder="e.g. users_*.csv"
                  value={config.pattern}
                  onChange={(e) =>
                    updateData({
                      source_config: { ...config, pattern: e.target.value },
                    })
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-slate-400 italic max-w-[60%]">
                We will look for the most recent file matching this pattern to
                extract the schema.
              </p>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
              >
                {isScanning ? (
                  <>
                    Scanning...
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </>
                ) : (
                  <>
                    Scan For Files
                    <Search className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
            <HardDrive className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Select an SFTP connection to start
          </p>
        </div>
      )}
    </div>
  );
}
