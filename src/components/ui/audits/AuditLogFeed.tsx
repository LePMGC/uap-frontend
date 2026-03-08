// src/components/audit/AuditLogFeed.tsx
import { useEffect, useState } from "react";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { auditLogService } from "@/services/auditLogService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { TraceTimelineDrawer } from "./TraceTimelineDrawer";

export function AuditLogFeed() {
  const { showToast } = useToastStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1,
    from: 1,
    to: 15,
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await auditLogService.getLogs(page, pagination.per_page);
      setLogs(response.data);
      setPagination((prev) => ({ ...prev, ...response }));
    } catch (error) {
      showToast("Failed to fetch logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.current_page);
  }, [pagination.current_page]);

  const columns = [
    {
      header: "Timestamp",
      accessor: (item: any) => (
        <span className="text-xs font-mono">{item.timestamp}</span>
      ),
    },
    {
      header: "Event",
      accessor: (item: any) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{item.event}</p>
          <p className="text-[10px] text-slate-400 uppercase font-medium">
            {item.module}
          </p>
        </div>
      ),
    },
    {
      header: "User",
      accessor: (item: any) => (
        <span className="text-xs font-medium text-slate-600">{item.user}</span>
      ),
    },
    {
      header: "Status",
      accessor: (item: any) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold",
            item.status === "SUCCESS"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600",
          )}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Trace",
      className: "text-right",
      accessor: (item: any) => (
        <button
          onClick={() => setSelectedTraceId(item.trace_id)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
          title="View Trace Timeline"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <GenericDataTable
        title="System Activity Feed"
        titleSize="text-[11px] uppercase tracking-wider text-slate-400"
        data={logs}
        isLoading={loading}
        columns={columns}
        pagination={pagination}
        onPageChange={(page) =>
          setPagination((p) => ({ ...p, current_page: page }))
        }
        showAdd={false}
        showExport={false}
      />

      <TraceTimelineDrawer
        traceId={selectedTraceId}
        onClose={() => setSelectedTraceId(null)}
      />
    </>
  );
}
