// src/components/audit/SecurityLogs.tsx
import { useEffect, useState } from "react";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { auditLogService } from "@/services/auditLogService";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export function SecurityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogService.getSecurityLogs().then((res) => {
      setLogs(res.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    {
      header: "Time",
      accessor: (item: any) => (
        <span className="text-xs font-mono">{item.timestamp}</span>
      ),
    },
    {
      header: "Security Event",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          {item.status === "SUCCESS" ? (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-bold">{item.event}</span>
        </div>
      ),
    },
    {
      header: "Details",
      accessor: (item: any) => (
        <span className="text-xs text-slate-500 truncate max-w-xs block">
          {JSON.stringify(item.details)}
        </span>
      ),
    },
  ];

  return (
    <GenericDataTable
      title="Security & Access Audit"
      data={logs}
      isLoading={loading}
      columns={columns}
      showAdd={false}
      showExport={false}
    />
  );
}
