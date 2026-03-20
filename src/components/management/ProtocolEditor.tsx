// src/components/management/commands/ProtocolEditor.tsx
import Editor from "@monaco-editor/react";

interface ProtocolEditorProps {
  template: string;
  language: "xml" | "mml" | "binary";
  onChange: (value: string | undefined) => void;
}

export function ProtocolEditor({
  template,
  language,
  onChange,
}: ProtocolEditorProps) {
  // Map our category formats to Monaco languages
  const getLanguage = (lang: string) => {
    switch (lang) {
      case "xml":
        return "xml";
      case "mml":
        return "plaintext"; // MML is often custom, plaintext works best
      default:
        return "plaintext";
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <Editor
        height="100%"
        defaultLanguage={getLanguage(language)}
        theme="vs-light"
        value={template}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          padding: { top: 16 },
          wordWrap: "on",
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
