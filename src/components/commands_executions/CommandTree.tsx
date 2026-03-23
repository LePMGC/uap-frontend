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
  selectedId?: number | string | null; // Controlled from parent
}

export default function CommandTree({
  onSelect,
  selectedId: externalSelectedId,
}: CommandTreeProps) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [activeId, setActiveId] = useState<any>(null);

  // Sync internal active ID with external selection (for hydration/redirects)
  useEffect(() => {
    if (externalSelectedId) {
      setActiveId(externalSelectedId);
    }
  }, [externalSelectedId]);

  const loadTree = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const data = await commandService.getCommandTree(search);
      setTreeData(data);

      if (search) {
        const autoExpand: Record<string, boolean> = {};
        data.forEach((group: any) => {
          if (group.commands?.length > 0) autoExpand[group.slug] = true;
        });
        setExpandedGroups(autoExpand);
      } else if (data.length > 0 && Object.keys(expandedGroups).length === 0) {
        setExpandedGroups({ [data[0].slug]: true });
      }
    } catch (error) {
      console.error("Failed to load command tree", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadTree(searchQuery), 300);
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-white shrink-0">
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
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">
        {loading && searchQuery === "" ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Loading...
            </span>
          </div>
        ) : (
          treeData.map((group) => (
            <div key={group.slug} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.slug)}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded-md transition-colors"
              >
                {expandedGroups[group.slug] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <Box className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                  {group.name}
                </span>
              </button>

              {expandedGroups[group.slug] && (
                <div className="ml-4 pl-3 border-l border-slate-200 space-y-0.5 py-1">
                  {group.commands?.map((cmd: any) => {
                    const isSelected = activeId === cmd.id;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          setActiveId(cmd.id);
                          onSelect(cmd);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-all",
                          isSelected
                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        )}
                      >
                        <div
                          className={cn(
                            "h-5 w-5 rounded flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-white"
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
                              "text-[8px] font-bold uppercase tracking-tighter",
                              isSelected ? "text-indigo-500" : "opacity-60",
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
