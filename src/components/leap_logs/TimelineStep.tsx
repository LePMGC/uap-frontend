// /var/www/html/uap-frontend/src/components/leap_logs/TimelineStep.tsx
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Server,
  Database,
  Cpu,
  Send,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css"; // ✅ correct
import { cn } from "@/lib/utils";
import type { LeapLogStep } from "@/types/leapLogs";
import { motion, AnimatePresence } from "framer-motion";

export function TimelineStep({
  step,
  isLast,
}: {
  step: LeapLogStep;
  isLast: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isError =
    step.status !== "0" && step.status !== 200 && step.status !== "200";

  const getIcon = () => {
    const source = (step.system_source || "").toLowerCase();
    if (source.includes("dbill")) return <Database className="h-3.5 w-3.5" />;
    if (source.includes("ecs")) return <Cpu className="h-3.5 w-3.5" />;
    if (source.includes("smsc")) return <Send className="h-3.5 w-3.5" />;
    return <Server className="h-3.5 w-3.5" />;
  };

  const executionMs = Number(step.execution_ms);

  return (
    <div className="relative pl-8 pb-8">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 border-l-2 border-dashed border-slate-200" />
      )}

      <div
        className={cn(
          "absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
          isError ? "bg-red-500 text-white" : "bg-green-500 text-white",
        )}
      >
        {isError ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <CheckCircle2 className="h-3 w-3" />
        )}
      </div>

      <div
        className={cn(
          "bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
          isOpen
            ? "ring-2 ring-indigo-500/20 border-indigo-200"
            : "border-slate-200",
        )}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "p-2 rounded-xl shrink-0",
                isError
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-50 text-slate-600",
              )}
            >
              {getIcon()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {step.system_source}
                </span>

                {/* MODULE ID DISPLAY */}
                {step.module_id && (
                  <>
                    <span className="text-[1px] text-slate-300">•</span>
                    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 text-[12px] font-mono font-bold text-amber-700">
                      <Terminal className="h-2.5 w-2.5" />
                      {step.module_id}
                    </div>
                  </>
                )}

                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(step.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    fractionalSecondDigits: 3,
                  })}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {step.method}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isNaN(executionMs) && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                  executionMs > 1000
                    ? "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-600",
                )}
              >
                <Clock className="h-3 w-3" />
                {executionMs}ms
              </div>
            )}

            <div
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                isError
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700",
              )}
            >
              Status: {step.status}
            </div>

            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 bg-slate-50/50"
            >
              <div className="p-4 font-mono text-xs overflow-x-auto custom-scrollbar">
                <JsonView src={step.payload} collapsed={1} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
