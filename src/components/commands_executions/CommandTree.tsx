import { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Box,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { commandService } from "@/services/commandService";

interface CommandTreeProps {
  onSelect: (command: any) => void;
}

export default function CommandTree({ onSelect }: CommandTreeProps) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Load Tree Data with Search
  const loadTree = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const data = await commandService.getCommandTree(search);
      setTreeData(data);

      // If we are searching, auto-expand all groups that have results
      if (search && search.length > 0) {
        const autoExpand: Record<string, boolean> = {};
        data.forEach((group: any) => {
          if (group.commands && group.commands.length > 0) {
            autoExpand[group.slug] = true;
          }
        });
        setExpandedGroups(autoExpand);
      } else if (data.length > 0 && Object.keys(expandedGroups).length === 0) {
        // Default expand first group on initial load if nothing is expanded
        setExpandedGroups({ [data[0].slug]: true });
      }
    } catch (error) {
      console.error("Failed to load command tree", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTree(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, loadTree]);

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const actionColors: Record<string, string> = {
    view: "bg-blue-500",
    create: "bg-green-500",
    update: "bg-amber-500",
    delete: "bg-red-500",
    run: "bg-indigo-500",
    get: "bg-blue-500",
    set: "bg-amber-500",
  };

  const actionBgColors: Record<string, string> = {
    view: "bg-blue-50",
    create: "bg-green-50",
    update: "bg-amber-50",
    delete: "bg-red-50",
    run: "bg-indigo-50",
    get: "bg-blue-50",
    set: "bg-amber-50",
  };

  return (
    <div className="flex flex-col h-full">
      {/* SEARCH INPUT AREA */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands..."
            className="w-full pl-9 pr-8 py-2 bg-slate-100 border-transparent rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {loading && searchQuery === "" ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Loading Tree...
            </span>
          </div>
        ) : treeData.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-slate-400">No commands found</p>
          </div>
        ) : (
          treeData.map((group) => (
            <div key={group.slug} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.slug)}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded-md transition-colors group"
              >
                {expandedGroups[group.slug] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <Box className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  {group.name}
                </span>
                <span className="ml-auto text-[9px] font-bold bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded">
                  {group.commands?.length || 0}
                </span>
              </button>

              {expandedGroups[group.slug] && (
                <div className="ml-4 pl-3 border-l border-slate-200 space-y-0.5 py-1">
                  {group.commands?.map((cmd: any) => {
                    const isSelected = selectedId === cmd.id;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          setSelectedId(cmd.id);
                          onSelect(cmd);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-all group/item",
                          isSelected
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        )}
                      >
                        <div
                          className={cn(
                            "h-5 w-5 rounded flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-white shadow-sm"
                              : actionBgColors[cmd.action] || "bg-slate-100",
                          )}
                        >
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              actionColors[cmd.action] || "bg-slate-400",
                            )}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-medium truncate">
                            {cmd.name}
                          </span>
                          <span
                            className={cn(
                              "text-[8px] font-bold uppercase tracking-tighter opacity-60 group-hover/item:opacity-100",
                              isSelected && "text-indigo-500 opacity-100",
                            )}
                          >
                            {cmd.action || "unknown"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
