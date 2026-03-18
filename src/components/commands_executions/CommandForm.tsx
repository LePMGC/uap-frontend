// src/components/commands_executions/CommandForm.tsx
import { Layers } from "lucide-react";

interface CommandFormProps {
  parameters: any;
  values: any;
  onChange: (path: string, value: any) => void;
}

export default function CommandForm({
  parameters,
  values,
  onChange,
}: CommandFormProps) {
  const renderField = (key: string, value: any, path: string) => {
    const currentPath = path ? `${path}.${key}` : key;

    // CASE 1: Array (List)
    if (Array.isArray(value)) {
      return (
        <div
          key={currentPath}
          className="col-span-full space-y-4 mt-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4
              className="text-[12px] font-bold text-indigo-600 flex items-center gap-2"
              style={{ textTransform: "none" }} // Force BE Casing
            >
              <Layers className="h-3.5 w-3.5" />
              {key}
            </h4>
          </div>

          {value.map((item, index) => (
            <div
              key={`${currentPath}.${index}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm relative"
            >
              <div className="absolute -top-2 -right-2 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                Item #{index + 1}
              </div>
              {Object.entries(item).map(([childKey, childValue]) =>
                renderField(childKey, childValue, `${currentPath}.${index}`),
              )}
            </div>
          ))}
        </div>
      );
    }

    // CASE 2: Object
    if (typeof value === "object" && value !== null) {
      return (
        <div
          key={currentPath}
          className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50/30"
        >
          <div
            className="col-span-full text-[11px] font-bold text-slate-400"
            style={{ textTransform: "none" }} // Force BE Casing
          >
            {key}
          </div>
          {Object.entries(value).map(([childKey, childValue]) =>
            renderField(childKey, childValue, currentPath),
          )}
        </div>
      );
    }

    // CASE 3: Standard Input
    return (
      <div key={currentPath} className="flex flex-col gap-1.5">
        <label
          className="text-[11px] font-semibold text-slate-700"
          style={{ textTransform: "none" }} // Force BE Casing
        >
          {key}
        </label>
        <input
          type={typeof value === "number" ? "number" : "text"}
          value={getNestedValue(values, currentPath) ?? ""}
          placeholder={`Enter ${key}...`}
          onChange={(e) => onChange(currentPath, e.target.value)}
          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-5xl">
      {Object.entries(parameters || {}).map(([key, value]) =>
        renderField(key, value, ""),
      )}
    </div>
  );
}

function getNestedValue(obj: any, path: string) {
  if (!obj) return undefined;
  return path.split(".").reduce((prev, curr) => prev?.[curr], obj);
}
