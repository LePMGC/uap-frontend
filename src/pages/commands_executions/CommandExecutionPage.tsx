import { useState, useCallback, useRef, useEffect } from "react";
import {
  PanelLeft,
  Play,
  ChevronRight,
  Search,
  Loader2,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandTree from "@/components/commands_executions/CommandTree";
import BuilderPanel from "@/components/commands_executions/BuilderPanel";
import ResultsPanel from "@/components/commands_executions/ResultsPanel";
import { commandService } from "@/services/commandService";
import { providerInstanceService } from "@/services/providerInstanceService";

export default function CommandExecutionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCommand, setSelectedCommand] = useState<any>(null);
  const [executionData, setExecutionData] = useState({
    mode: "form",
    data: {},
  });
  const [isExecuting, setIsExecuting] = useState(false);

  // --- INSTANCE SELECTION STATE ---
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | number>(
    "",
  );
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // --- FETCH INSTANCES ON COMMAND SELECTION ---
  useEffect(() => {
    if (!selectedCommand?.category_slug) {
      setInstances([]);
      setSelectedInstanceId("");
      return;
    }

    const fetchInstances = async () => {
      setIsLoadingInstances(true);
      try {
        const data = await providerInstanceService.getAllbyCategory(
          selectedCommand.category_slug,
        );
        setInstances(data);
        if (data.length > 0) {
          setSelectedInstanceId(data[0].id);
        } else {
          setSelectedInstanceId("");
        }
      } catch (error) {
        console.error("Failed to load provider instances", error);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    fetchInstances();
  }, [selectedCommand?.category_slug]);

  useEffect(() => {
    if (selectedCommand) {
      setLastResult(null);
    }
  }, [selectedCommand?.id]);

  // --- RESIZING LOGIC ---
  const [resultsWidth, setResultsWidth] = useState(500);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 250 && newWidth < window.innerWidth - 600) {
      setResultsWidth(newWidth);
    }
  }, []);

  const handleRun = async () => {
    if (!selectedInstanceId) {
      alert("Please select a provider instance first.");
      return;
    }

    setIsExecuting(true);
    try {
      const requestPayload = {
        command_id: selectedCommand.id,
        instance_id: selectedInstanceId,
        mode: executionData.mode,
        payload: executionData.data,
      };

      const response = await commandService.execute(requestPayload);

      // Laravel Resource usually returns { data: { id, payloads, ... } }
      // We want the inner data object
      const finalData = response?.data?.data || response?.data || response;
      setLastResult(finalData);
    } catch (error: any) {
      console.error("Execution failed", error);

      // Try to extract the log data from the error response
      const errorData = error.response?.data?.data || error.response?.data;

      if (errorData && errorData.payloads) {
        setLastResult(errorData);
      } else {
        // Manual fallback if server fails completely
        setLastResult({
          result: { is_successful: false },
          payloads: {
            request: { data: executionData.data, raw: "" },
            response: {
              message: error.message,
              code: error.response?.status || 500,
            },
          },
          metadata: { timestamp: new Date().toISOString() },
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* 1. TOP NAV BAR */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0",
              !isSidebarOpen && "text-indigo-600 bg-indigo-50",
            )}
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {/* DYNAMIC BREADCRUMB */}
          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              {selectedCommand?.category_slug || "Provider Category"}
            </span>

            <ChevronRight className="h-3 w-3 text-slate-300 shrink-0 hidden sm:inline" />

            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-900 tracking-tight">
                {selectedCommand?.name || "Select Command"}
              </span>
              {selectedCommand?.command_key && (
                <span className="text-slate-400 font-normal">
                  ({selectedCommand.command_key})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. INSTANCE SELECTION & RUN BUTTON */}
        <div className="flex items-center gap-4 pl-4 shrink-0">
          {selectedCommand && (
            <div className="flex items-center gap-2">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  {isLoadingInstances ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                  ) : (
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
                <select
                  value={selectedInstanceId}
                  onChange={(e) => setSelectedInstanceId(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none min-w-[180px]"
                >
                  {instances.length === 0 && !isLoadingInstances && (
                    <option value="">No instances available</option>
                  )}
                  {instances.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.is_active ? "🟢" : "🔴"} {inst.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="h-3 w-3 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={!selectedInstanceId || isExecuting}
            className={cn(
              "flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-[13px] hover:bg-indigo-700 transition-all shadow-md active:scale-95 shadow-indigo-100",
              (!selectedInstanceId || isExecuting) &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            {isExecuting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            Run
          </button>
        </div>
      </header>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: SIDEBAR */}
        <aside
          className={cn(
            "bg-slate-50/50 border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0",
            isSidebarOpen
              ? "w-72"
              : "w-0 opacity-0 -translate-x-full overflow-hidden",
          )}
        >
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                placeholder="Search commands..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <CommandTree onSelect={setSelectedCommand} />
          </div>
        </aside>

        {/* CENTER (Builder) & RIGHT (Results) */}
        <div className="flex-1 flex min-w-0 bg-slate-100 overflow-hidden">
          <BuilderPanel
            selectedCommandSummary={selectedCommand}
            onStateChange={setExecutionData}
          />

          {/* Draggable Divider */}
          <div
            onMouseDown={startResizing}
            className="w-1.5 bg-slate-50 relative cursor-col-resize group flex-shrink-0 hover:bg-indigo-100 transition-colors"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 z-30" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-200 group-hover:bg-indigo-400 transition-colors z-20" />
          </div>

          <ResultsPanel width={resultsWidth} results={lastResult} />
        </div>
      </main>
    </div>
  );
}
