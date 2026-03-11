// src/components/management/commands/ParameterRow.tsx
import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  GripVertical,
  Layers,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ParameterRow = ({
  param,
  depth,
}: {
  param: any;
  depth: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = param.children && param.children.length > 0;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "group flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white transition-all",
          depth > 0 && "ml-4",
        )}
      >
        <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />

        <div className="flex items-center gap-2 min-w-[140px]">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-slate-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-indigo-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <span
            className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1",
              param.type === "array"
                ? "bg-purple-50 text-purple-600 border border-purple-100"
                : hasChildren
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-slate-100 text-slate-500",
            )}
          >
            {param.type === "array" && <Layers className="h-2 w-2" />}
            {param.type}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-3">
          {param.is_array_item ? (
            // Style for "0", "1", "2"
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-[10px] font-bold text-white shadow-sm">
                {param.name}
              </span>
              <span className="text-xs text-slate-400 font-medium italic">
                ({param.type})
              </span>
            </div>
          ) : (
            // Style for normal members
            <div className="grid grid-cols-2 gap-4 w-full">
              <span className="text-xs font-mono font-bold text-slate-700">
                {param.name}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {param.label}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* ... Keep REQ toggle and Trash icon same as previous ... */}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-8 mt-1 space-y-1 relative border-l border-slate-100">
          {param.children.map((child: any) => (
            <ParameterRow key={child.id} param={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function ParameterTree({
  parameters,
}: {
  parameters: any[];
  onChange: (data: any[]) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Command Parameter Tree
        </span>
        <button className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
          <Plus className="h-3.5 w-3.5" /> Add Root Parameter
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4">
        {parameters.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No parameters defined. Start by adding a field or struct.
          </div>
        ) : (
          parameters.map((p) => <ParameterRow key={p.id} param={p} depth={0} />)
        )}
      </div>
    </div>
  );
}
