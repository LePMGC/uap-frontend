// src/components/audit/ConnectivityStats.tsx
import { useEffect, useState } from "react";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { auditLogService } from "@/services/auditLogService";

export function ConnectivityStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogService.getConnectivityStats().then((res) => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    {
      header: "Provider Name",
      accessor: (item: any) => (
        <span className="font-bold text-slate-700">{item.provider_name}</span>
      ),
    },
    {
      header: "Total Requests",
      accessor: (item: any) => <span className="font-mono">{item.total}</span>,
    },
    {
      header: "Success/Failed",
      accessor: (item: any) => (
        <div className="flex gap-2 text-[11px] font-bold">
          <span className="text-green-600">{item.success} OK</span>
          <span className="text-red-600">{item.failed} ERR</span>
        </div>
      ),
    },
    {
      header: "Health Score",
      accessor: (item: any) => {
        const rate = parseFloat(item.failure_rate);
        return (
          <div className="w-full max-w-[100px] bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={rate > 20 ? "bg-red-500" : "bg-green-500"}
              style={{ width: `${100 - rate}%`, height: "100%" }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <GenericDataTable
      title="Provider Connectivity Health"
      data={stats}
      isLoading={loading}
      columns={columns}
      showAdd={false}
      showExport={false}
    />
  );
}
