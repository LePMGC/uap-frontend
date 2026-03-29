import { useState, useEffect } from "react";
import {
  ArrowRight,
  Database,
  Type,
  ChevronDown,
  Trash2,
  RotateCcw,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2Props {
  data: any;
  updateData: (newData: Partial<any>) => void;
  commandParameters: any[];
}

export function Step2DataMapping({
  data,
  updateData,
  commandParameters = [],
}: Step2Props) {
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([]);
  const sourceFields = data.preview?.headers || [];

  // 🔵 INITIALIZATION LOGIC
  // Automatically map parameters that have a 'value' from the BE as 'static' by default
  useEffect(() => {
    const initialMapping = { ...data.column_mapping };
    let hasChanges = false;

    commandParameters.forEach((param) => {
      // Only initialize if no mapping exists yet for this key AND a value is provided by BE
      if (
        !initialMapping[param.key] &&
        param.value !== undefined &&
        param.value !== null
      ) {
        initialMapping[param.key] = {
          mode: "static",
          value: String(param.value), // Ensure it's a string for the input field
          excluded: false,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      updateData({ column_mapping: initialMapping });
    }
  }, [commandParameters]); // Runs when parameters are fetched from BE

  const toggleCollapse = (key: string) => {
    setCollapsedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleMappingUpdate = (targetKey: string, payload: any) => {
    const currentMapping = data.column_mapping || {};
    updateData({
      column_mapping: {
        ...currentMapping,
        [targetKey]: { ...currentMapping[targetKey], ...payload },
      },
    });
  };

  const isRowVisible = (paramKey: string) => {
    return !collapsedKeys.some((collapsedKey) =>
      paramKey.startsWith(collapsedKey + "."),
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
            <ArrowRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Field Mapping
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Connect source columns to command parameters.
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            setCollapsedKeys((prev) =>
              prev.length
                ? []
                : commandParameters
                    .filter((p: any) => p.isParent)
                    .map((p: any) => p.key),
            )
          }
          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-xl transition-all border border-slate-100"
        >
          {collapsedKeys.length ? "Expand All Groups" : "Collapse Groups"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-[35%]">
                Command Parameter
              </th>
              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">
                Mapping Mode
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-[30%]">
                Source / Static Value
              </th>
              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center w-20">
                Skip
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {commandParameters.map((param: any) => {
              if (!isRowVisible(param.key)) return null;

              // Use the state-stored mapping, or a local default if not yet initialized
              const current = data.column_mapping?.[param.key] || {
                mode: "static",
                value: param.value || "",
                excluded: false,
              };

              const isExcluded = current.excluded;
              const isParent = param.isParent;
              const isCollapsed = collapsedKeys.includes(param.key);
              const displayName = param.key.split(".").pop();

              return (
                <tr
                  key={param.key}
                  className={cn(
                    "group transition-all duration-200",
                    isExcluded
                      ? "bg-slate-50/50 opacity-40 grayscale"
                      : "hover:bg-slate-50/20",
                    isParent && "bg-slate-50/40",
                  )}
                >
                  <td className="px-8 py-4">
                    <div
                      className="flex items-center"
                      style={{ paddingLeft: `${param.level * 24}px` }}
                    >
                      {param.level > 0 && (
                        <div className="w-4 h-6 border-l-2 border-b-2 border-slate-200 rounded-bl-lg mr-2 -mt-4 shrink-0" />
                      )}

                      {isParent ? (
                        <button
                          onClick={() => toggleCollapse(param.key)}
                          className="flex items-center gap-2 group/btn"
                        >
                          <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center group-hover/btn:border-indigo-300 transition-colors shadow-sm">
                            {isCollapsed ? (
                              <ChevronRight className="h-3 w-3 text-indigo-600" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3 text-indigo-600" />
                            )}
                          </div>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                            {displayName}
                          </span>
                          <span className="text-[8px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase">
                            {param.type}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-800 font-mono">
                              {displayName}
                            </span>
                            {param.is_required && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-200"
                                title="Required Field"
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium lowercase italic">
                            {param.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {!isParent && (
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-24">
                          <button
                            disabled={isExcluded}
                            onClick={() =>
                              handleMappingUpdate(param.key, {
                                mode: "dynamic",
                                value: "",
                              })
                            }
                            className={cn(
                              "flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all",
                              current.mode === "dynamic"
                                ? "bg-white shadow-sm text-indigo-600"
                                : "text-slate-400",
                            )}
                          >
                            <Database className="h-4 w-4" />
                          </button>
                          <button
                            disabled={isExcluded}
                            onClick={() =>
                              handleMappingUpdate(param.key, {
                                mode: "static",
                                value: param.value || "",
                              })
                            }
                            className={cn(
                              "flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all",
                              current.mode === "static"
                                ? "bg-white shadow-sm text-indigo-600"
                                : "text-slate-400",
                            )}
                          >
                            <Type className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center w-24">
                          <div
                            className={cn(
                              "h-[1.5px] flex-1 transition-all",
                              current.value && !isExcluded
                                ? "bg-emerald-400"
                                : "bg-slate-200",
                            )}
                          />
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 -mx-1 transition-all",
                              current.value && !isExcluded
                                ? "bg-emerald-50 border-emerald-200 text-emerald-500 shadow-sm"
                                : "bg-white border-slate-200 text-slate-300",
                            )}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <div
                            className={cn(
                              "h-[1.5px] flex-1 transition-all",
                              current.value && !isExcluded
                                ? "bg-emerald-400"
                                : "bg-slate-200",
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-8 py-4">
                    {!isParent &&
                      (current.mode === "dynamic" ? (
                        <div className="relative">
                          <select
                            disabled={isExcluded}
                            value={current.value}
                            onChange={(e) =>
                              handleMappingUpdate(param.key, {
                                value: e.target.value,
                              })
                            }
                            className="w-full h-11 px-4 pr-10 rounded-2xl border appearance-none bg-white text-[12px] font-bold outline-none border-slate-200 text-slate-700 focus:border-indigo-500 transition-all shadow-sm"
                          >
                            <option value="">-- Choose Column --</option>
                            {sourceFields.map((header: string) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          disabled={isExcluded}
                          type="text"
                          placeholder="Enter static value..."
                          value={current.value}
                          onChange={(e) =>
                            handleMappingUpdate(param.key, {
                              value: e.target.value,
                            })
                          }
                          className="w-full h-11 px-4 rounded-2xl border bg-white text-[12px] font-bold outline-none border-slate-200 focus:border-indigo-500 text-slate-700 placeholder:text-slate-300 transition-all shadow-sm"
                        />
                      ))}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() =>
                        handleMappingUpdate(param.key, {
                          excluded: !isExcluded,
                        })
                      }
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        isExcluded
                          ? "bg-slate-200 text-slate-600"
                          : "text-slate-300 hover:text-red-500 hover:bg-red-50",
                      )}
                    >
                      {isExcluded ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <HelpCircle className="h-4 w-4 text-amber-600" />
        </div>
        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
          The fields have been pre-filled with default values where available.
          You can change the mapping to a source column using the{" "}
          <Database className="h-3 w-3 inline mb-0.5" /> icon.
        </p>
      </div>
    </div>
  );
}
