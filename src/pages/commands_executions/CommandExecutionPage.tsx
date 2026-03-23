import { useState, useCallback, useRef, useEffect } from "react";
import { PanelLeft, Play, ChevronRight, Loader2, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import CommandTree from "@/components/commands_executions/CommandTree";
import BuilderPanel from "@/components/commands_executions/BuilderPanel";
import ResultsPanel from "@/components/commands_executions/ResultsPanel";
import { commandService } from "@/services/commandService";
import { providerInstanceService } from "@/services/providerInstanceService";
import { useToastStore } from "@/hooks/useToastStore";

export default function CommandExecutionPage() {
  const { showToast } = useToastStore(); // Initialize toast
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

  // --- FETCH INSTANCES ---
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
          // 👇 Find first active instance
          const activeInstance = data.find((inst: any) => inst.is_active);

          // 👇 Use active if found, otherwise fallback to first
          setSelectedInstanceId(
            activeInstance ? activeInstance.id : data[0].id,
          );
        } else {
          setSelectedInstanceId("");
        }
      } catch (error) {
        console.error("Failed to load instances", error);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    fetchInstances();
  }, [selectedCommand?.category_slug]);

  const handleRun = async () => {
    // 1. Instance Check
    if (!selectedInstanceId) {
      showToast("Please select a provider instance", "error");
      return;
    }

    // 2. Payload Validation Guard
    const data = executionData.data;
    const isPayloadEmpty =
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === "object" && Object.keys(data).length === 0) ||
      (typeof data === "string" && data.trim() === "");

    if (isPayloadEmpty) {
      showToast(
        "Command payload cannot be empty. Please fill the required fields.",
        "error",
      );
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
      const finalData = response?.data?.data || response?.data || response;

      setLastResult(finalData);
      showToast("Command executed successfully", "success");
    } catch (error: any) {
      console.error("Execution failed", error);

      // Capture Backend validation messages (e.g. "The payload field is required")
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.message || error.message || "Execution failed";

      showToast(errorMessage, "error");

      if (errorData?.data?.payloads || errorData?.payloads) {
        setLastResult(errorData.data || errorData);
      } else {
        setLastResult({
          result: { is_successful: false },
          payloads: {
            request: { data: executionData.data, raw: "" },
            response: {
              message: errorMessage,
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

  // --- RESIZING LOGIC (Keep existing) ---
  const [resultsWidth, setResultsWidth] = useState(500);
  const isResizing = useRef(false);
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  }, []);
  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  }, []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 250 && newWidth < window.innerWidth - 600)
      setResultsWidth(newWidth);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 hover:bg-slate-100 rounded-lg transition-colors",
              !isSidebarOpen && "text-indigo-600 bg-indigo-50",
            )}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate">
              {selectedCommand?.category_slug || "Provider Category"}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="font-bold text-slate-900 truncate">
              {selectedCommand?.name || "Select Command"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-4 shrink-0">
          {selectedCommand && (
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isLoadingInstances ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                ) : (
                  <Server className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              <select
                value={selectedInstanceId}
                onChange={(e) => setSelectedInstanceId(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none min-w-[180px]"
              >
                {instances.length === 0 && !isLoadingInstances && (
                  <option value="">No instances</option>
                )}
                {instances.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.is_active ? "🟢" : "🔴"} {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={isExecuting}
            className={cn(
              "flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-[13px] hover:bg-indigo-700 transition-all shadow-md active:scale-95 shadow-indigo-100",
              isExecuting && "opacity-50 cursor-not-allowed",
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

      <main className="flex-1 flex overflow-hidden">
        <aside
          className={cn(
            "bg-slate-50/50 border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0",
            isSidebarOpen ? "w-72" : "w-0 opacity-0 overflow-hidden",
          )}
        >
          <div className="flex-1 overflow-y-auto py-2">
            <CommandTree onSelect={setSelectedCommand} />
          </div>
        </aside>

        <div className="flex-1 flex min-w-0 bg-slate-100 overflow-hidden">
          <BuilderPanel
            selectedCommandSummary={selectedCommand}
            onStateChange={setExecutionData}
          />
          <div
            onMouseDown={startResizing}
            className="w-1.5 bg-slate-50 relative cursor-col-resize group flex-shrink-0 hover:bg-indigo-100 transition-colors"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-200 group-hover:bg-indigo-400 z-20" />
          </div>
          <ResultsPanel width={resultsWidth} results={lastResult} />
        </div>
      </main>
    </div>
  );
}
