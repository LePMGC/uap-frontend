import { useState } from "react";
import {
  ArrowRight,
  Database,
  Type,
  ChevronDown,
  Trash2,
  RotateCcw,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2Props {
  data: any;
  updateData: (newData: Partial<any>) => void;
}

export function Step2DataMapping({ data, updateData }: Step2Props) {
  // State to track which parent nodes are collapsed
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([]);

  const commandParameters = [
    {
      key: "subscriberNumber",
      type: "String",
      defaultValue: "1510101224",
      level: 0,
    },
    { key: "originHostName", type: "String", defaultValue: "minsat", level: 0 },
    {
      key: "subDedicatedAccountUpdateInformation",
      type: "Array",
      level: 0,
      isParent: true,
    },
    {
      key: "subDedicatedAccountUpdateInformation.dedicatedAccountID",
      type: "Int",
      defaultValue: "2",
      level: 1,
    },
    {
      key: "subDedicatedAccountUpdateInformation.subDedicatedAccountIdentifier",
      type: "Struct",
      level: 1,
      isParent: true,
    },
    {
      key: "subDedicatedAccountUpdateInformation.subDedicatedAccountIdentifier.startDateCurrent",
      type: "DateTime",
      defaultValue: "99991231T12:00:00",
      level: 2,
    },
    {
      key: "subDedicatedAccountUpdateInformation.subDedicatedAccountIdentifier.expiryDateCurrent",
      type: "DateTime",
      defaultValue: "20111030T12:00:00",
      level: 2,
    },
    {
      key: "subDedicatedAccountUpdateInformation.adjustmentAmountRelative",
      type: "String",
      defaultValue: "300",
      level: 1,
    },
    {
      key: "transactionCurrency",
      type: "String",
      defaultValue: "EGP",
      level: 0,
    },
  ];

  const sourceFields = data.preview?.schema?.[0]
    ? Object.keys(data.preview.schema[0]).map((field) => ({
        label: field,
        value: field,
      }))
    : [];

  /* --- HANDLERS --- */

  const toggleCollapse = (key: string) => {
    setCollapsedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleMappingUpdate = (targetKey: string, payload: any) => {
    const currentMapping = data.mapping || {};
    updateData({
      mapping: {
        ...currentMapping,
        [targetKey]: { ...currentMapping[targetKey], ...payload },
      },
    });
  };

  // Logic to determine if a row should be hidden based on parent collapse state
  const isRowVisible = (paramKey: string) => {
    return !collapsedKeys.some((collapsedKey) =>
      paramKey.startsWith(collapsedKey + "."),
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            setCollapsedKeys((prev) =>
              prev.length
                ? []
                : commandParameters.filter((p) => p.isParent).map((p) => p.key),
            )
          }
          className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all"
        >
          {collapsedKeys.length ? "Expand All" : "Collapse All"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-[35%]">
                Structure & Parameter
              </th>
              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">
                Connection
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-[30%]">
                Source / Value
              </th>
              <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center w-20">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {commandParameters.map((param) => {
              if (!isRowVisible(param.key)) return null;

              const current = data.mapping?.[param.key] || {
                mode: "static",
                value: param.defaultValue,
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
                    isParent && "bg-slate-50/30",
                  )}
                >
                  {/* TARGET COLUMN */}
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
                          <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center group-hover/btn:border-indigo-300 transition-colors">
                            {isCollapsed ? (
                              <ChevronRight className="h-3 w-3 text-indigo-600" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3 text-indigo-600" />
                            )}
                          </div>
                          <span className="text-[12px] font-black text-slate-700 uppercase tracking-wider">
                            {displayName}
                          </span>
                          <span className="text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">
                            {param.type}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-800 font-mono">
                            {displayName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium lowercase italic">
                            {param.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* CONNECTION COLUMN */}
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
                                value: param.defaultValue,
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
                              "h-[1.5px] flex-1",
                              current.value && !isExcluded
                                ? "bg-emerald-400"
                                : "bg-slate-200",
                            )}
                          />
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 -mx-1",
                              current.value && !isExcluded
                                ? "bg-emerald-50 border-emerald-200 text-emerald-500"
                                : "bg-white border-slate-200 text-slate-300",
                            )}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <div
                            className={cn(
                              "h-[1.5px] flex-1",
                              current.value && !isExcluded
                                ? "bg-emerald-400"
                                : "bg-slate-200",
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </td>

                  {/* VALUE INPUT */}
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
                            className="w-full h-11 px-4 pr-10 rounded-2xl border appearance-none bg-white text-[12px] font-medium outline-none border-slate-200 text-slate-900"
                          >
                            <option value="">-- Source Field --</option>
                            {sourceFields.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          disabled={isExcluded}
                          type="text"
                          value={current.value}
                          onChange={(e) =>
                            handleMappingUpdate(param.key, {
                              value: e.target.value,
                            })
                          }
                          className="w-full h-11 px-4 rounded-2xl border bg-white text-[12px] font-medium outline-none border-slate-200 focus:border-indigo-500 text-slate-900"
                        />
                      ))}
                  </td>

                  {/* ACTION */}
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
    </div>
  );
}
