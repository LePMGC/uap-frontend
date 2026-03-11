import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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

export interface ActionItem<T> {
  label: string | ((item: T) => string);
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "danger";
  hidden?: (item: T) => boolean;
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
  actions?: ActionItem<T>[];
  filters?: FilterConfig[];
  onAddClick?: () => void;
  onExportClick?: () => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  pagination?: PaginationMetadata;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (query: string) => void;
  // Feature Toggles
  showAdd?: boolean;
  showExport?: boolean;
  titleSize?: string;
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
  searchPlaceholder = "Search...",
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  showAdd = true,
  showExport = true,
  titleSize = "text-xl", // Defaulting to the original size
}: GenericDataTableProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if we should show the internal Actions column
  const hasActions = actions && actions.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* ROW 1: TITLE & SUBTITLE */}
      {(title || subtitle) && (
        <div className="px-4 pt-3 pb-1">
          <h3
            className={cn("font-bold text-slate-900 tracking-tight", titleSize)}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ROW 2: SEARCH, FILTERS, AND BUTTONS (UNIFIED) */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
        {/* Unified Search & Filters */}
        <div className="flex flex-1 items-center gap-2 max-w-3xl">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {filters.map((filter, index) => (
              <div key={index} className="relative">
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showExport && onExportClick && (
            <button
              onClick={onExportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          )}

          {showAdd && onAddClick && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto relative">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {/* Conditional Internal Actions Header */}
              {hasActions && (
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="px-6 py-4"
                  >
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-400 text-sm"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
  // Logic to determine if this is one of the last rows
  const isLastRows = rowIdx >= data.length - 2 && data.length > 2;

  return (
    <tr key={rowIdx} className="...">
      {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-6 py-4 text-sm text-slate-600",
                        column.className,
                      )}
                    >
                      {typeof column.accessor === "function"
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}

      {hasActions && (
        <td className="px-6 py-4 text-right">
          <div className="relative flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === rowIdx ? null : rowIdx);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {openMenuId === rowIdx && (
              <div
                ref={menuRef}
                className={cn(
                  "absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in duration-200",
                  // IF it's the last rows, move it UP, otherwise move it DOWN
                  isLastRows ? "bottom-full mb-2 origin-bottom" : "top-10 origin-top"
                )}
              >
                {actions.map((action, actionIdx) => {
                              if (action.hidden?.(item)) return null;
                              return (
                                <button
                                  key={actionIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item);
                                    setOpenMenuId(null);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors",
                                    action.variant === "danger"
                                      ? "text-red-600 hover:bg-red-50"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                  )}
                                >
                                  {action.icon}
                                  {typeof action.label === "function"
                                    ? action.label(item)
                                    : action.label}
                                </button>
                              );
                            })}
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  );
})
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination Logic */}
      {pagination && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400">
            Showing <span className="text-slate-900">{pagination.from}</span> to{" "}
            <span className="text-slate-900">{pagination.to}</span> of{" "}
            <span className="text-slate-900">{pagination.total}</span> entries
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">
                Rows per page:
              </span>
              <select
                className="bg-transparent text-[11px] font-bold text-slate-900 focus:outline-none"
                value={pagination.per_page}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              >
                {[5, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 border-l pl-6 border-slate-200">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => onPageChange?.(pagination.current_page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center px-2">
                <span className="text-xs font-bold px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                  {pagination.current_page}
                </span>
                <span className="text-[11px] font-bold text-slate-400 mx-2 text-nowrap">
                  of {pagination.last_page}
                </span>
              </div>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => onPageChange?.(pagination.current_page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
