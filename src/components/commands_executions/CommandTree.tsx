import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Terminal,
  Box,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { commandService } from "@/services/commandService";

interface CommandTreeProps {
  onSelect: (command: any) => void;
}

export default function CommandTree({ onSelect }: CommandTreeProps) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Define the action colors to match your CommandGrid
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

  useEffect(() => {
    const loadTree = async () => {
      try {
        const data = await commandService.getCommandTree();
        setTreeData(data);
        if (data.length > 0) {
          setExpandedGroups({ [data[0].slug]: true });
        }
      } catch (error) {
        console.error("Failed to load command tree", error);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, []);

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Loading Tree...
        </span>
      </div>
    );
  }

  return (
    <div className="px-2 space-y-1">
      {treeData.map((group) => (
        <div key={group.slug} className="space-y-1">
          {/* CATEGORY GROUP */}
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

          {/* COMMAND ITEMS */}
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
                    {/* DECORATED ICON: A small colored circle or Terminal with colored background */}
                    <div
                      className={cn(
                        "h-5 w-5 rounded flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-white shadow-sm"
                          : actionBgColors[cmd.action] || "bg-slate-100",
                      )}
                    >
                      {/* Dot indicator inside the box */}
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
                      {/* Small action tag - Optional, only if you want explicit text */}
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
      ))}
    </div>
  );
}
