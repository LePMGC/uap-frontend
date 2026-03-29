import { useState, useEffect } from "react";
import {
  Database,
  Table,
  Code2,
  ChevronDown,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dataSourceService } from "@/services/dataSourceService";
import { batchJobsService } from "@/services/batchJobsService";
import { useToastStore } from "@/hooks/useToastStore";

export function DatabaseSource({ data, updateData }: any) {
  const { showToast } = useToastStore();
  const [mode, setMode] = useState<"table" | "query">(
    data.source_config?.mode || "table",
  );

  const [connections, setConnections] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // 1. Fetch available database connections
  useEffect(() => {
    const fetchConnections = async () => {
      setIsLoadingConnections(true);
      try {
        const response = await dataSourceService.getAll(1, 999, {
          type: "database",
        });
        const fetchedData = response.data || response || [];
        setConnections(fetchedData);
      } catch (error) {
        console.error("Failed to fetch database sources:", error);
        showToast("Could not load database connections", "error");
      } finally {
        setIsLoadingConnections(false);
      }
    };
    fetchConnections();
  }, []);

  const updateConfig = (newFields: any) => {
    updateData({
      source_config: { ...data.source_config, ...newFields, mode },
    });
  };

  // Sync mode changes to parent state
  useEffect(() => {
    updateConfig({ mode });
  }, [mode]);

  // 2. Trigger Discovery/Preview
  const handleDiscover = async () => {
    if (!data.source_id) {
      showToast("Please select a connection first", "error");
      return;
    }

    // Validation based on mode
    if (mode === "table" && !data.source_config?.table) {
      showToast("Please enter a table name", "error");
      return;
    }
    if (mode === "query" && !data.source_config?.query) {
      showToast("Please enter an SQL query", "error");
      return;
    }

    setIsDiscovering(true);
    try {
      const payload = {
        data_source_id: data.source_id,
        source_config: data.source_config,
        number_of_rows: 10,
      };

      const response = await batchJobsService.discoverSchema(payload);

      // Update global wizard state with headers and preview rows
      updateData({
        preview: {
          fileName:
            mode === "table"
              ? `Table: ${data.source_config.table}`
              : "Custom SQL Query",
          headers: response.headers,
          schema: response.preview, // The DataPreviewPanel uses 'schema' key for rows
        },
      });

      showToast("Schema discovered successfully", "success");
    } catch (error: any) {
      console.error("Discovery Error:", error);
      showToast(
        error.response?.data?.error ||
          "Failed to fetch database schema. Check your query/table name.",
        "error",
      );
    } finally {
      setIsDiscovering(true); // Small delay for UX if needed, or set false
      setIsDiscovering(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* SECTION 1: CONNECTION SELECTION */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          1. Select Database Connection
        </label>
        <div className="relative">
          <select
            disabled={isLoadingConnections}
            className={cn(
              "w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white appearance-none focus:border-indigo-500 transition-all",
              isLoadingConnections && "opacity-50 cursor-not-allowed",
            )}
            value={data.source_id || ""}
            onChange={(e) => updateData({ source_id: e.target.value })}
          >
            <option value="">
              {isLoadingConnections
                ? "Loading connections..."
                : "Choose a saved database..."}
            </option>
            {connections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({conn.connection_settings?.driver || conn.type})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoadingConnections ? (
              <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {data.source_id ? (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-400">
          {/* SECTION 2: MODE SWITCHER */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              2. Data Selection Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("table")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                  mode === "table"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Table className="h-3.5 w-3.5" />
                Select Table
              </button>
              <button
                type="button"
                onClick={() => setMode("query")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                  mode === "query"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                SQL Query
              </button>
            </div>
          </div>

          {/* SECTION 3: DYNAMIC FORM */}
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4">
            {mode === "table" ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase">
                  Table Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. users, transactions, orders..."
                    value={data.source_config?.table || ""}
                    onChange={(e) => updateConfig({ table: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase">
                    Custom SQL Statement
                  </label>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
                    Advanced
                  </span>
                </div>
                <textarea
                  value={data.source_config?.query || ""}
                  onChange={(e) => updateConfig({ query: e.target.value })}
                  placeholder="SELECT u.id, u.email, p.amount FROM users u JOIN payments p ON u.id = p.user_id WHERE p.status = 'paid'..."
                  className="w-full h-40 p-4 rounded-2xl border border-slate-200 font-mono text-[11px] leading-relaxed focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                />
              </div>
            )}

            {/* PREVIEW ACTION */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleDiscover}
                disabled={isDiscovering}
                className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDiscovering ? (
                  <>
                    Analyzing Connection...
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </>
                ) : (
                  <>
                    Test & Fetch Data
                    <Database className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
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
            <Database className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
            Select a database connection above <br /> to configure the source
          </p>
        </div>
      )}
    </div>
  );
}
