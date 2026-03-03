import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterConfig {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

// FIX: Added <T> generic to ActionItem so it can be passed to GenericDataTableProps
export interface ActionItem<T> {
  label: string | ((item: T) => string);
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "danger";
}

interface PaginationMetadata {
  current_page: number;
  from: number;
  to: number;
  total: number;
  last_page: number;
  per_page: number;
}

interface GenericDataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  actions?: ActionItem<T>[]; // FIX: Passed the <T> type argument here
  filters?: FilterConfig[];
  onAddClick?: () => void;
  onExportClick?: () => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  pagination?: PaginationMetadata;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (value: string) => void;
}

export function GenericDataTable<T>({
  title,
  subtitle,
  data,
  columns,
  actions,
  filters = [],
  onAddClick,
  onExportClick,
  searchPlaceholder = "Filter items...",
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
}: GenericDataTableProps<T>) {
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the menu is open and the clicked target is NOT inside the dropdownRef container
      if (
        openMenuIdx !== null &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuIdx(null);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIdx]);

  return (
    <div className="w-full space-y-4">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExportClick}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Item
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)} // Trigger the BE fetch
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            {filters.map((filter, index) => (
              <div key={index} className="relative">
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none hover:border-slate-300 transition-colors appearance-none pr-8 cursor-pointer"
                >
                  <option value="">{filter.label}: All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="h-3 w-3 text-slate-400 rotate-90" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. Main Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 w-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600"
                    />
                  </th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                        col.className,
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item, idx) => (
                  <tr
                    key={idx}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    {columns.map((col, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-6 py-4 text-sm text-slate-600",
                          col.className,
                        )}
                      >
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right relative">
                      <div
                        ref={openMenuIdx === idx ? dropdownRef : null}
                        className="inline-block text-left"
                      >
                        <button
                          onClick={() =>
                            setOpenMenuIdx(openMenuIdx === idx ? null : idx)
                          }
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenuIdx === idx && (
                          <div
                            className={cn(
                              "absolute right-6 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] py-1.5 animate-in fade-in zoom-in duration-200",

                              idx >= data.length - 2 && data.length > 3
                                ? "bottom-full mb-2 origin-bottom"
                                : "top-10 origin-top",
                            )}
                          >
                            {actions?.map((action, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={() => {
                                  action.onClick(item);
                                  setOpenMenuIdx(null);
                                }}
                                className={cn(
                                  "w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2 transition-colors",
                                  action.variant === "danger"
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-slate-600 hover:bg-slate-50",
                                )}
                              >
                                {action.icon && (
                                  <span className="opacity-70">
                                    {action.icon}
                                  </span>
                                )}
                                {typeof action.label === "function"
                                  ? action.label(item)
                                  : action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Updated Footer / Pagination Section */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          {/* Left Side: Status Text */}
          <p className="text-[11px] font-medium text-slate-400">
            Showing{" "}
            <span className="text-slate-900 font-bold">
              {pagination?.from ?? 0} to {pagination?.to ?? 0}
            </span>{" "}
            of{" "}
            <span className="text-slate-900 font-bold">
              {pagination?.total ?? 0}
            </span>{" "}
            items
          </p>

          {/* Right Side: Grouped Controls */}
          <div className="flex items-center gap-6">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Rows per page:
              </span>
              <select
                value={pagination?.per_page || 5}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="text-[11px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
              >
                {[5, 10, 15, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1 border-l pl-6 border-slate-100">
              <button
                disabled={pagination?.current_page === 1}
                onClick={() =>
                  onPageChange?.((pagination?.current_page ?? 1) - 1)
                }
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                  Page
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                  {pagination?.current_page}
                </span>
                <span className="text-[11px] font-bold text-slate-400 mx-2">
                  of
                </span>
                <span className="text-[11px] font-bold text-slate-900">
                  {pagination?.last_page}
                </span>
              </div>

              <button
                disabled={pagination?.current_page === pagination?.last_page}
                onClick={() =>
                  onPageChange?.((pagination?.current_page ?? 1) + 1)
                }
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
