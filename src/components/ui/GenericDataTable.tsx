// /var/www/html/uap-frontend/src/components/ui/GenericDataTable.tsx
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
import { createPortal } from "react-dom";
import { useAuthStore } from "@/store/authStore";
import { Filter, ChevronUp } from "lucide-react";

export interface FilterConfig {
  id: string;

  // Name shown in the Filters dropdown
  menuLabel?: string;

  // Existing dropdown props
  label?: string;
  value?: string;
  options?: { label: string; value: string }[];
  onChange?: (value: string) => void;

  custom?: React.ReactNode;
}

export interface FilterContentItem {
  id: string;
  label: string;
  element: React.ReactNode;
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
  /** Pass an array of string permissions. User needs at least one to view the action item. */
  permissions?: string[];
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
  /** Pass a single string token required to view/trigger the Add button */
  addPermission?: string;
  onExportClick?: () => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  pagination?: PaginationMetadata;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (query: string) => void;
  showAdd?: boolean;
  showExport?: boolean;
  titleSize?: string;
  filterContent?: FilterContentItem[];
  searchWidth?: string;
}

export function GenericDataTable<T>({
  title,
  subtitle,
  data,
  columns,
  actions = [],
  filters = [],
  onAddClick,
  addPermission,
  onExportClick,
  searchPlaceholder = "Search...",
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  showAdd = true,
  showExport = true,
  titleSize = "text-xl",
  searchWidth = "w-full",
  filterContent,
}: GenericDataTableProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const filterKeys = filters.map(
    (filter, index) => filter.id || filter.label || `filter-${index}`,
  );
  const [visibleFilters, setVisibleFilters] = useState<string[]>(
    filterContent?.map((f) => f.id) ?? [],
  );
  const filterContentKeys = (filterContent ?? []).map((f) => f.id);
  const allFilterKeys = [...filterKeys, ...filterContentKeys];

  // Pull active user authority configurations directly inside the loop
  const userPermissions = useAuthStore(
    (state) => state.user?.permissions || [],
  );

  useEffect(() => {
    setVisibleFilters((current) =>
      current.filter((k) => filterContentKeys.includes(k)),
    );
  }, [filterContentKeys.join(",")]);

  // Sync menu state out when interacting with background layers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }

      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Filter out actions if user lacks required permission tokens
  const allowedActions = actions.filter((action) => {
    if (!action.permissions || action.permissions.length === 0) return true;
    return action.permissions.some((perm) => userPermissions.includes(perm));
  });

  // 2. Validate user holds specific clearances before making primary addition CTA visible
  const isAdditionVisible =
    showAdd &&
    onAddClick &&
    (!addPermission || userPermissions.includes(addPermission));

  const hasActions = allowedActions.length > 0;
  const hasFilters = allFilterKeys.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-visible">
      {/* ROW 1: TITLE & SUBTITLE */}
      {(title || subtitle) && (
        <div className="px-4 pt-3 pb-1">
          <h3
            className={cn("font-bold text-slate-900 tracking-tight", titleSize)}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ROW 2: CONTROLS */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        {/* Left Control Column: Search Bar & Select Filters Panel */}
        <div className="flex flex-1 flex-col lg:flex-row lg:items-center gap-3 w-full">
          {/* Search Field */}
          <div className={cn("relative shrink-0", searchWidth)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          {/* Filters Panel */}
          <div className="flex flex-wrap items-center gap-2 w-full">
            {filters.map((filter, index) => {
              const key = filter.id || filter.label || `filter-${index}`;

              if (!visibleFilters.includes(key)) {
                return null;
              }

              if (filter.custom) {
                return <div key={key}>{filter.custom}</div>;
              }

              return (
                <div key={key} className="relative shrink-0">
                  <select
                    value={filter.value ?? ""}
                    onChange={(e) => filter.onChange?.(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/10 appearance-none h-9"
                  >
                    <option value="">{filter.label}</option>

                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
              );
            })}
            {filterContent?.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleFilters.includes(item.id)}
                  onChange={() =>
                    setVisibleFilters((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((x) => x !== item.id)
                        : [...prev, item.id],
                    )
                  }
                />

                <span className="text-xs text-slate-700">{item.label}</span>
              </label>
            ))}

            {filterContent
              ?.filter((item) => visibleFilters.includes(item.id))
              .map((item) => (
                <React.Fragment key={item.id}>{item.element}</React.Fragment>
              ))}
          </div>
        </div>

        {/* Right Action Column: CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {hasFilters && (
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setFilterMenuOpen((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-50 transition-all shadow-sm h-9"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {filterMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-50 p-2">
                  <div className="px-2 pb-2 mb-2 border-b text-xs font-semibold text-slate-500">
                    Visible Filters
                  </div>

                  {[
                    ...filters.map((filter) => ({
                      id: filter.id,
                      label: filter.menuLabel ?? filter.label ?? filter.id,
                    })),
                    ...(filterContent ?? []).map((item) => ({
                      id: item.id,
                      label: item.label,
                    })),
                  ].map((filter) => (
                    <label
                      key={filter.id}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleFilters.includes(filter.id)}
                        onChange={() => {
                          setVisibleFilters((prev) =>
                            prev.includes(filter.id)
                              ? prev.filter((x) => x !== filter.id)
                              : [...prev, filter.id],
                          );
                        }}
                      />

                      <span className="text-xs text-slate-700">
                        {filter.label}
                      </span>
                    </label>
                  ))}

                  {allFilterKeys.length > 1 && (
                    <div className="mt-3 pt-2 border-t flex gap-2">
                      <button
                        className="flex-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={() => setVisibleFilters(allFilterKeys)}
                      >
                        Show All
                      </button>

                      <button
                        className="flex-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={() => setVisibleFilters([])}
                      >
                        Hide All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showExport && onExportClick && (
            <button
              onClick={onExportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm h-9"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          )}

          {isAdditionVisible && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 h-9"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Main Table Layer */}
      <div className="overflow-x-auto overflow-y-visible relative">
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
              data.map((item, rowIdx) => (
                <tr key={rowIdx}>
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
                      {(() => {
                        const visibleActions = allowedActions.filter(
                          (action) => !action.hidden?.(item),
                        );

                        if (visibleActions.length === 0) {
                          return null;
                        }

                        // Single action -> render icon button directly
                        if (visibleActions.length === 1) {
                          const action = visibleActions[0];

                          return (
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(item);
                                }}
                                title={
                                  typeof action.label === "function"
                                    ? action.label(item)
                                    : action.label
                                }
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  action.variant === "danger"
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-900",
                                )}
                              >
                                {action.icon ?? (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          );
                        }

                        // Multiple actions -> existing dropdown
                        return (
                          <div className="relative flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                setMenuPosition({
                                  top: rect.bottom + window.scrollY,
                                  left: rect.right - 192 + window.scrollX,
                                });

                                setOpenMenuId(
                                  openMenuId === rowIdx ? null : rowIdx,
                                );
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {openMenuId === rowIdx &&
                              createPortal(
                                <div
                                  ref={menuRef}
                                  className="fixed w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-[9999]"
                                  style={{
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                  }}
                                >
                                  {visibleActions.map((action, actionIdx) => (
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
                                  ))}
                                </div>,
                                document.body,
                              )}
                          </div>
                        );
                      })()}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination View Block */}
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
                className="bg-transparent text-[11px] font-bold text-slate-900 focus:outline-none cursor-pointer"
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
