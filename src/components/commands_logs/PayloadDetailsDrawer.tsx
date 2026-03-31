import { useState } from "react";
import { X, Check, Copy, Terminal, Info, Braces, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtocolEditor } from "../management/ProtocolEditor";

interface PayloadDetailsDrawerProps {
  log: any;
  isOpen: boolean;
  onClose: () => void;
}

const formatXml = (xml: string): string => {
  if (!xml) return "";
  const PADDING = "  ";
  let indent = "";
  let out = "";

  const cleanXml = xml.replace(/>\s*</g, "><").trim();
  const formattedArray = cleanXml
    .replace(/(>)(<)(\/*)/g, "$1\r\n$2$3")
    .split("\r\n");

  formattedArray.forEach((node) => {
    if (node.match(/^<\/\w/)) {
      indent = indent.substring(PADDING.length);
    }
    out += indent + node + "\r\n";
    if (node.match(/^<\w[^>]*[^\/]>$/) && !node.startsWith("<?xml")) {
      indent += PADDING;
    }
  });

  return out.trim();
};

export function PayloadDetailsDrawer({
  log,
  isOpen,
  onClose,
}: PayloadDetailsDrawerProps) {
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!log) return null;

  const isPreviewMode = log.id === "PREVIEW_MODE" || log.id === "PROJECTION";
  const requestData = log.payloads?.request?.data || {};
  const rawPayload = log.payloads?.request?.raw || "";
  const responseData = log.payloads?.response?.data || null;
  const format = log.command_info?.format || "xml";

  const displayPayload =
    format === "xml" && rawPayload ? formatXml(rawPayload) : rawPayload;

  const handleCopy = async (
    text: string,
    type: "request" | "response" | "raw",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "request") {
        setCopiedRequest(true);
        setTimeout(() => setCopiedRequest(false), 2000);
      } else if (type === "raw") {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
      } else {
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9999] animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[650px] bg-white shadow-2xl z-[10000] transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Terminal className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {log.command_info?.name || "Command Details"}
              </h3>
              <span
                className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                  isPreviewMode
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-500",
                )}
              >
                {isPreviewMode ? "Preview Projection" : `Log ID: ${log.id}`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Change: Added 'flex flex-col' to this container to allow the child to grow */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-8 custom-scrollbar">
          {/* Section 1: Request JSON - Hidden in Preview */}
          {!isPreviewMode && (
            <section className="shrink-0 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Braces className="h-3 w-3 text-indigo-400" />
                  Request Payload (JSON)
                </h4>
                <button
                  onClick={() =>
                    handleCopy(JSON.stringify(requestData, null, 2), "request")
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-white text-indigo-600 border-slate-200 shadow-sm"
                >
                  {copiedRequest ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedRequest ? "Copied!" : "Copy JSON"}
                </button>
              </div>
              <pre className="p-4 bg-[#0f172a] text-slate-300 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner">
                {JSON.stringify(requestData, null, 2)}
              </pre>
            </section>
          )}

          {/* Section 2: Raw Provider Payload */}
          {/* Change: Conditionally add 'flex-1' and 'min-h-[400px]' */}
          <section
            className={cn(
              "flex flex-col",
              isPreviewMode ? "flex-1 min-h-0" : "h-[500px] shrink-0",
            )}
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Code2 className="h-3 w-3 text-indigo-400" />
                {isPreviewMode
                  ? "Generated Provider String"
                  : "Raw Provider Payload"}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                  Format: {format}
                </span>
                <button
                  onClick={() => handleCopy(displayPayload, "raw")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-white text-indigo-600 border-slate-200 shadow-sm"
                >
                  {copiedRaw ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedRaw ? "Copied!" : "Copy Raw"}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <ProtocolEditor
                template={displayPayload}
                language={format as any}
                onChange={() => {}}
              />
            </div>
          </section>

          {/* Section 3: Execution Response (Historical only) */}
          {!isPreviewMode && responseData && (
            <section className="shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Execution Response
                  </h4>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(responseData, null, 2),
                      "response",
                    )
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-white text-indigo-600 border-slate-200 shadow-sm"
                >
                  {copiedResponse ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedResponse ? "Copied!" : "Copy JSON"}
                </button>
              </div>
              <pre className="p-4 bg-[#0f172a] text-slate-300 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </section>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm"
          >
            {isPreviewMode ? "Finish Review" : "Close Inspector"}
          </button>
        </div>
      </div>
    </>
  );
}
