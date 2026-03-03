import { useToastStore } from "@/hooks/useToastStore";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalToast() {
  const { message, type, isVisible, hideToast } = useToastStore();

  if (!isVisible) return null;

  return (
    /* Changed fixed-bottom-right to fixed-top-middle logic */
    <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 animate-in slide-in-from-top-14 fade-in duration-300">
      <div
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl border shadow-2xl bg-white",
          type === "success"
            ? "border-green-100 shadow-green-900/5"
            : "border-red-100 shadow-red-900/5",
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600",
          )}
        >
          {type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-[13px] font-bold text-slate-900 leading-tight">
            {type === "success" ? "Success" : "Attention Required"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
            {message}
          </p>
        </div>

        <button
          onClick={hideToast}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
