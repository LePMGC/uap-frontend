// src/pages/operations/CommandLogsPage.tsx
import { useEffect, useState } from "react";
import { Terminal, Clock, User, Eye, RotateCcw } from "lucide-react";

import { commandService } from "@/services/commandService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import {
  GenericDataTable,
  type ActionItem,
  type Column,
} from "@/components/ui/GenericDataTable";
import { PayloadDetailsDrawer } from "@/components/commands_logs/PayloadDetailsDrawer";
import { useNavigate } from "react-router-dom";

export default function CommandLogsPage() {
  const { showToast } = useToastStore();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<any>({
    current_page: 1,
    total: 0,
    per_page: 5,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = { search: searchQuery, status: statusFilter };
      const response = await commandService.getCommandLogs(
        currentPage,
        pageSize,
        filters,
      );

      if (response && response.data) {
        setLogs(response.data);

        const meta = response.meta;
        setPagination({
          current_page: meta?.current_page || 1,
          total: meta?.total || 0,
          last_page: meta?.last_page || 1,
          per_page: meta?.per_page || 5,
          from: meta?.from || 0,
          to: meta?.to || 0,
        });
      }
    } catch (error) {
      showToast("Failed to load command logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  // --- DATA TABLE COLUMN PROPS CONFIG ---
  const columns: Column<any>[] = [
    {
      header: "Command & Instance",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              item?.result?.is_successful
                ? "bg-indigo-50 text-indigo-600"
                : "bg-red-50 text-red-600",
            )}
          >
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-800 truncate">
              {item?.command_info?.name || "Unknown Command"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {item?.command_info?.instance_name || "Unknown Instance"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Target (MSISDN)",
      accessor: (item: any) => (
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
          #{" "}
          {item?.payloads?.request?.data?.subscriberNumber ?? "Raw / No MSISDN"}
        </span>
      ),
    },
    {
      header: "Status",
      className: "text-center",
      accessor: (item: any) => (
        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase",
              item?.result?.is_successful
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {item?.result?.is_successful ? "SUCCESS" : "FAILED"}
          </span>
          <span className="text-[9px] font-bold text-slate-400">
            Code: {item?.payloads?.response?.code ?? "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Executed By",
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User className="h-3 w-3 text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-700">
            {item?.executed_by?.username || "System Component"}
          </span>
        </div>
      ),
    },
    {
      header: "Execution",
      accessor: (item: any) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">
            {item?.metadata?.execution_time || "---"}
          </span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      accessor: (item: any) => {
        const timestamp = item?.metadata?.timestamp;
        if (!timestamp)
          return <span className="text-xs text-slate-400">N/A</span>;

        const [date, time] = timestamp.split(" ");
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700">{date}</span>
            <span className="text-[10px] font-bold text-slate-400">{time}</span>
          </div>
        );
      },
    },
  ];

  const actions: ActionItem<any>[] = [
    {
      label: "View Payloads",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (item: any) => {
        setSelectedLog(item);
        setIsDrawerOpen(true);
      },
    },
    {
      label: "Edit & Retry",
      icon: <RotateCcw className="h-3.5 w-3.5" />,
      onClick: (item: any) => {
        if (item?.id) {
          navigate(`/single-execution?from_log=${item.id}`);
        }
      },
    },
  ];

  // --- STRUCTURED ROW FILTER CONFIGS ---
  const filterConfigs = [
    {
      id: "status",
      label: "All Statuses",
      value: statusFilter,
      options: [
        { label: "Success logs", value: "success" },
        { label: "Failure logs", value: "failed" },
      ],
      onChange: (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <GenericDataTable
        title="Execution Command Logs"
        subtitle="Comprehensive history of all provider interactions and system payloads."
        data={logs}
        isLoading={loading}
        columns={columns}
        actions={actions}
        pagination={pagination}
        filters={filterConfigs}
        showAdd={false}
        searchPlaceholder="Search logs..."
        searchWidth="w-full md:w-64 md:shrink-0" // Aligns the search input neatly without crowding other options
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />
      <PayloadDetailsDrawer
        log={selectedLog}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
