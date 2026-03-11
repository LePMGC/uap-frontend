// src/components/management/commands/ProtocolEditor.tsx
import { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";

// Import Prism languages
import "prismjs/components/prism-markup"; // XML/HTML
import "prismjs/components/prism-clike";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme

interface ProtocolEditorProps {
  template: string;
  format: string;
  onChange: (value: string) => void;
}

export function ProtocolEditor2({
  template,
  format,
  onChange,
}: ProtocolEditorProps) {
  const [code, setCode] = useState(template || "");

  useEffect(() => {
    setCode(template || "");
  }, [template]);

  // Map provider format to Prism language
  const getLanguage = (fmt: string) => {
    switch (fmt.toLowerCase()) {
      case "xml":
        return Prism.languages.markup;
      case "mml":
        return Prism.languages.clike; // MML is often similar to CLI/C-like syntax
      default:
        return Prism.languages.markup;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          payload_template.{format}
        </span>
      </div>

      {/* Scrollable Editor Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Editor
          value={code}
          onValueChange={(val) => {
            setCode(val);
            onChange(val);
          }}
          highlight={(code) =>
            Prism.highlight(code, getLanguage(format), format)
          }
          padding={20}
          className="font-mono text-sm min-h-full outline-none"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            color: "#e1e1e1",
          }}
        />
      </div>

      {/* Hint Footer */}
      <div className="px-4 py-1.5 bg-[#252525] border-t border-slate-700">
        <p className="text-[10px] text-slate-500 italic">
          Tip: Use{" "}
          <span className="text-indigo-400 font-bold">{"{variable_name}"}</span>{" "}
          to map parameters from the Architect.
        </p>
      </div>
    </div>
  );
}
