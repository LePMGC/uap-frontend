import { useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

import {
  Database,
  Code2,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  FileJson,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Editor from "@monaco-editor/react";

interface ResultsPanelProps {
  width: number;
  results: any;
}

export default function ResultsPanel({ width, results }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "outputs" | "raw_request" | "raw" | "metadata"
  >("outputs");

  if (!results) {
    return (
      <div
        style={{ width }}
        className="bg-white flex flex-col items-center justify-center text-slate-400"
      >
        <Database className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No execution results yet</p>
      </div>
    );
  }

  // Destructure based on your new BE Resource structure
  const { payloads, result, command_info, executed_by, metadata } = results;

  const formatExecutionDate = (ts: string) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRawContent = (raw: string, format: string) => {
    if (!raw) return "";
    try {
      if (format?.toLowerCase() === "xml") {
        let formatted = "";
        let indent = "";
        const tab = "  ";
        raw.split(/>\s*</).forEach((node) => {
          if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
          formatted += indent + "<" + node + ">\r\n";
          if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
        });
        return formatted.substring(1, formatted.length - 3);
      }
      if (format?.toLowerCase() === "json") {
        return JSON.stringify(JSON.parse(raw), null, 2);
      }
    } catch (e) {
      console.error("Formatting failed", e);
    }
    return raw;
  };

  return (
    <div
      style={{ width }}
      className="bg-white flex flex-col border-l border-slate-200 h-full overflow-hidden"
    >
      {/* 1. TOP HEADER STATS */}
      <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {result?.is_successful ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-500" />
            )}
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                result?.is_successful ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {result?.is_successful ? "Success" : "Failed"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 border-l border-slate-200 pl-4">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold tracking-tight">
              {metadata?.execution_time || "---"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] font-medium">
              {formatExecutionDate(metadata?.timestamp)}
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(results, null, 2))
          }
          className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all active:scale-95"
        >
          <Copy className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex border-b border-slate-100 px-2 bg-white shrink-0">
        {[
          { id: "outputs", label: "Outputs", icon: FileJson },
          { id: "raw_request", label: "Raw Request", icon: Code2 },
          { id: "raw", label: "Raw Response", icon: Database },
          { id: "metadata", label: "Metadata", icon: Info },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-[11px] font-bold transition-all border-b-2 mt-px",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {activeTab === "outputs" && (
          <div className="h-full overflow-auto p-4 custom-json-container space-y-6">
            <div className="flex gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold border",
                  result?.is_successful
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-100",
                )}
              >
                CODE: {payloads?.response?.code}
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold border",
                  result?.is_successful
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-rose-50 text-rose-600 border-rose-100",
                )}
              >
                {payloads?.response?.message ||
                  (result?.is_successful ? "Success" : "Execution Failed")}
              </span>
            </div>

            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Code2 className="h-3 w-3" /> Form Request Data
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-2">
                <JsonView
                  src={payloads?.request?.data || {}}
                  collapsed={false}
                  enableClipboard={true}
                />
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Database className="h-3 w-3" /> Response Data
              </h4>
              <div className="bg-white rounded-lg border border-slate-100 p-2">
                <JsonView
                  src={payloads?.response?.data || {}}
                  collapsed={1}
                  enableClipboard={true}
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === "raw_request" && (
          <Editor
            height="100%"
            language={
              metadata?.format?.toLowerCase() === "xml" ? "xml" : "json"
            }
            theme="vs-light"
            value={formatRawContent(payloads?.request?.raw, metadata?.format)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "on",
              wordWrap: "on",
              folding: true,
              automaticLayout: true,
            }}
          />
        )}

        {activeTab === "raw" && (
          <Editor
            height="100%"
            language={
              metadata?.format?.toLowerCase() === "xml" ? "xml" : "json"
            }
            theme="vs-light"
            value={formatRawContent(payloads?.response?.raw, metadata?.format)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "on",
              wordWrap: "on",
              folding: true,
              automaticLayout: true,
            }}
          />
        )}

        {activeTab === "metadata" && (
          <div className="p-5 space-y-6 overflow-auto h-full">
            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Command Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <MetaCard label="Command" value={command_info?.name} />
                <MetaCard label="Category" value={command_info?.category} />
                <MetaCard
                  label="Instance"
                  value={command_info?.instance_name}
                  className="col-span-2"
                />
              </div>
            </section>
            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                System Identity
              </h4>
              <div className="p-3 border border-slate-100 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                  {executed_by?.username?.charAt(0) || "S"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {executed_by?.username}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {results.id}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-json-container .rjve-container { font-family: 'JetBrains Mono', monospace !important; font-size: 13px !important; }
        .custom-json-container .rjve-key { color: #64748b !important; }
        .custom-json-container .rjve-value-string { color: #4f46e5 !important; }
      `,
        }}
      />
    </div>
  );
}

function MetaCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-3 bg-slate-50 rounded-lg border border-slate-100",
        className,
      )}
    >
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-700 truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}
