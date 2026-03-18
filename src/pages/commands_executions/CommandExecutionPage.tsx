import { useState, useCallback, useRef } from "react";
import { PanelLeft, Play, ChevronRight, Search, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import CommandTree from "@/components/commands_executions/CommandTree";
import BuilderPanel from "@/components/commands_executions/BuilderPanel";
import ResultsPanel from "@/components/commands_executions/ResultsPanel";

export default function CommandExecutionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCommand, setSelectedCommand] = useState<any>(null);

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
            {/* Replaced "Execution Builder" with category_slug */}
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
              {selectedCommand?.category_slug || "Provider Category"}
            </span>

            <ChevronRight className="h-3 w-3 text-slate-300 shrink-0 hidden sm:inline" />

            <div className="flex items-center gap-1.5 truncate">
              {/* Command Name (Bold) */}
              <span className="font-bold text-slate-900 tracking-tight">
                {selectedCommand?.name || "Select Command"}
              </span>
              {/* Command Key (Normal weight in brackets) */}
              {selectedCommand?.command_key && (
                <span className="text-slate-400 font-normal">
                  ({selectedCommand.command_key})
                </span>
              )}
            </div>
          </div>

          {/* LAST RUN STATUS SECTION */}
          {selectedCommand && (
            <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-slate-200 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Last Run:
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-100">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-green-700 uppercase">
                  Success
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3 w-3" />
                <span className="text-[11px] font-medium italic">10m ago</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 shrink-0">
          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-[13px] hover:bg-indigo-700 transition-all shadow-md active:scale-95 shadow-indigo-100">
            <Play className="h-3.5 w-3.5 fill-current" />
            Run
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
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
          <BuilderPanel selectedCommandSummary={selectedCommand} />

          {/* Draggable Divider */}
          <div
            onMouseDown={startResizing}
            className="w-1.5 bg-slate-50 relative cursor-col-resize group flex-shrink-0 hover:bg-indigo-100 transition-colors"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 z-30" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-200 group-hover:bg-indigo-400 transition-colors z-20" />
          </div>

          <ResultsPanel width={resultsWidth} />
        </div>
      </main>
    </div>
  );
}
