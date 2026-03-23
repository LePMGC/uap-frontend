import { useState } from "react";
import { X, Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayloadDetailsDrawerProps {
  log: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PayloadDetailsDrawer({
  log,
  isOpen,
  onClose,
}: PayloadDetailsDrawerProps) {
  // States to track copy feedback for different sections
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!log) return null;

  const handleCopy = async (text: string, type: "request" | "response") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "request") {
        setCopiedRequest(true);
        setTimeout(() => setCopiedRequest(false), 2000);
      } else {
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      {/* Backdrop / Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9999] animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-[10000] transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Terminal className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {log.command_info?.name || "Command Details"}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                LOG_ID: {log.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* 1. Request Payload Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Request Payload (JSON)
              </h4>
              <button
                onClick={() =>
                  handleCopy(
                    JSON.stringify(log.payloads?.request?.data, null, 2),
                    "request",
                  )
                }
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                  copiedRequest
                    ? "bg-green-50 text-green-600 border-green-100"
                    : "bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50",
                )}
              >
                {copiedRequest ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-[#0f172a] text-slate-300 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
              {JSON.stringify(log.payloads?.request?.data, null, 2)}
            </pre>
          </section>

          {/* 2. Raw XML / SOAP Payload */}
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Raw Provider Payload
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 whitespace-pre-wrap break-all leading-relaxed">
              {log.payloads?.request?.raw || "No raw payload available"}
            </div>
          </section>

          {/* 3. Response Details Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Response Details
                </h4>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                    log.result?.is_successful
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700",
                  )}
                >
                  {log.result?.is_successful ? "Successful" : "Failed"}
                </span>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    JSON.stringify(log.payloads?.response?.data, null, 2),
                    "response",
                  )
                }
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                  copiedResponse
                    ? "bg-green-50 text-green-600 border-green-100"
                    : "bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50",
                )}
              >
                {copiedResponse ? (
                  <>
                    <Check className="h-3 w-3" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-[#0f172a] text-slate-300 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
              {JSON.stringify(log.payloads?.response?.data, null, 2)}
            </pre>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </>
  );
}
