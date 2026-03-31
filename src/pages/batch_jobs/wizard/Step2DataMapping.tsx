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
  Terminal,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { commandService } from "@/services/commandService";
import { PayloadDetailsDrawer } from "@/components/commands_logs/PayloadDetailsDrawer";
import { useToastStore } from "@/hooks/useToastStore";

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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [projectedLog, setProjectedLog] = useState<any>(null);
  const [isProjecting, setIsProjecting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { showToast } = useToastStore();

  // 1. Initial Mapping Logic
  useEffect(() => {
    const initialMapping = { ...data.column_mapping };
    let hasChanges = false;

    commandParameters.forEach((param) => {
      if (
        !initialMapping[param.key] &&
        param.value !== undefined &&
        param.value !== null
      ) {
        initialMapping[param.key] = {
          mode: "static",
          value: String(param.value),
          excluded: false,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      updateData({ column_mapping: initialMapping });
    }
  }, [commandParameters]);

  // 2. BLOCKING LOGIC & VALIDATION
  useEffect(() => {
    const errors: string[] = [];
    commandParameters.forEach((param) => {
      if (param.is_required && !param.isParent) {
        const mapping = data.column_mapping?.[param.key];
        // Error if: No mapping OR excluded OR empty value
        if (
          !mapping ||
          mapping.excluded ||
          !mapping.value ||
          String(mapping.value).trim() === ""
        ) {
          errors.push(param.key);
        }
      }
    });
    setValidationErrors(errors);

    // Sync validation state with parent to block "Next Step"
    const isValid = errors.length === 0;
    if (data.step2Valid !== isValid) {
      updateData({ step2Valid: isValid });
    }
  }, [data.column_mapping, commandParameters, data.step2Valid]);

  /* --- HANDLERS --- */

  const handleInspectPayload = async () => {
    if (!data.command_id) {
      showToast("No command selected for projection", "error");
      return;
    }
    setIsProjecting(true);
    try {
      const sampleRow = data.preview?.schema?.[0] || {};
      const response = await commandService.getProjectedPayload(
        data.command_id,
        data.column_mapping,
        sampleRow,
      );
      setProjectedLog({
        id: "PROJECTION",
        command_info: { name: data.command_name || "Command Preview" },
        payloads: { request: { data: {}, raw: response.projected_payload } },
        result: { is_successful: true },
      });
      setIsPreviewOpen(true);
    } catch (err) {
      showToast("Could not generate payload preview", "error");
    } finally {
      setIsProjecting(false);
    }
  };

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

        <div className="flex items-center gap-3">
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-[9px] font-black text-red-600 uppercase">
                {validationErrors.length} Required Field(s) Missing
              </span>
            </div>
          )}

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
            {collapsedKeys.length ? "Expand All" : "Collapse All"}
          </button>

          <button
            onClick={handleInspectPayload}
            disabled={isProjecting}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm shadow-indigo-100",
              isProjecting
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800",
            )}
          >
            {isProjecting ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            )}
            Live Preview
          </button>
        </div>
      </div>

      {/* MAPPING TABLE */}
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

              const current = data.column_mapping?.[param.key] || {
                mode: "static",
                value: param.value || "",
                excluded: false,
              };
              const isExcluded = current.excluded;
              const isParent = param.isParent;
              const isCollapsed = collapsedKeys.includes(param.key);
              const displayName = param.key.split(".").pop();
              const hasError = validationErrors.includes(param.key);

              return (
                <tr
                  key={param.key}
                  className={cn(
                    "group transition-all duration-200",
                    isExcluded
                      ? "bg-slate-50/50 opacity-40 grayscale"
                      : "hover:bg-slate-50/20",
                    isParent && "bg-slate-50/40",
                    hasError && !isExcluded && "bg-red-50/30",
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
                          <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            {isCollapsed ? (
                              <ChevronRight className="h-3 w-3 text-indigo-600" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3 text-indigo-600" />
                            )}
                          </div>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                            {displayName}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[13px] font-bold font-mono",
                                hasError ? "text-red-600" : "text-slate-800",
                              )}
                            >
                              {displayName}
                            </span>
                            {param.is_required && (
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shadow-sm",
                                  hasError
                                    ? "bg-red-500 animate-pulse shadow-red-200"
                                    : "bg-emerald-500 shadow-emerald-200",
                                )}
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
                        <div className="flex bg-slate-100 p-1 rounded-xl w-24">
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
                                ? "bg-white text-indigo-600 shadow-sm"
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
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-400",
                            )}
                          >
                            <Type className="h-4 w-4" />
                          </button>
                        </div>
                        {/* RESTORED LONG ARROW UI */}
                        <div className="flex items-center w-20">
                          <div
                            className={cn(
                              "h-[1.5px] flex-1",
                              !hasError && !isExcluded
                                ? "bg-emerald-400"
                                : "bg-slate-200",
                            )}
                          />
                          <div
                            className={cn(
                              "w-7 h-7 rounded-full border flex items-center justify-center shrink-0 -mx-1",
                              !hasError && !isExcluded
                                ? "bg-emerald-50 border-emerald-200 text-emerald-500"
                                : "bg-white border-slate-200 text-slate-300",
                            )}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </div>
                          <div
                            className={cn(
                              "h-[1.5px] flex-1",
                              !hasError && !isExcluded
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
                            className={cn(
                              "w-full h-11 px-4 pr-10 rounded-2xl border appearance-none bg-white text-[12px] font-bold outline-none transition-all shadow-sm",
                              hasError
                                ? "border-red-200 focus:border-red-400"
                                : "border-slate-200 focus:border-indigo-500",
                            )}
                          >
                            <option value="">-- Choose Column --</option>
                            {sourceFields.map((header: string) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                          className={cn(
                            "w-full h-11 px-4 rounded-2xl border bg-white text-[12px] font-bold outline-none transition-all shadow-sm",
                            hasError
                              ? "border-red-200 focus:border-red-400"
                              : "border-slate-200 focus:border-indigo-500",
                          )}
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
                      title={
                        param.is_required
                          ? "Skipping required fields may cause command failure"
                          : "Skip this field"
                      }
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
        <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
          Ensure all fields marked with a <strong>red dot</strong> have a
          mapping. You cannot skip required fields unless the provider logic
          allows it.
        </p>
      </div>

      <PayloadDetailsDrawer
        isOpen={isPreviewOpen}
        log={projectedLog}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
