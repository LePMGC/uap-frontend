import { Copy, Download } from "lucide-react";

interface ResultsPanelProps {
  width: number;
}

export default function ResultsPanel({ width }: ResultsPanelProps) {
  return (
    <section
      style={{ width: `${width}px` }}
      className="flex flex-col bg-white overflow-hidden shrink-0"
    >
      {/* Tabs */}
      <div className="h-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex gap-6 h-full items-center">
          <button className="text-[11px] font-bold text-indigo-600 border-b-2 border-indigo-600 h-full uppercase tracking-wider">
            Outputs
          </button>
          <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 h-full uppercase tracking-wider transition-colors">
            Logs
          </button>
          <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 h-full uppercase tracking-wider transition-colors">
            Metadata
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Technical Metadata Bar */}
      <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-5 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Code
          </span>
          <span className="text-[11px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
            200 OK
          </span>
        </div>
        <div className="h-3 w-px bg-slate-200 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Time
          </span>
          <span className="text-[11px] font-bold text-slate-700">142ms</span>
        </div>
        <div className="h-3 w-px bg-slate-200 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Size
          </span>
          <span className="text-[11px] font-bold text-slate-700">1.2 KB</span>
        </div>
      </div>

      {/* Payload Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 font-mono text-[12px]">
        <pre className="text-slate-500 italic">
          {"// No execution data yet. Click 'Run' to execute command."}
        </pre>
      </div>
    </section>
  );
}
