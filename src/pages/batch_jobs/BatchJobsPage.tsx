// src/pages/operations/BatchJobsPage.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Server,
  Database,
  Play,
  Copy,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { batchJobsService } from "@/services/batchJobsService";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";

export default function BatchJobsPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  // --- AUTH & PERMISSIONS CONTROLS ---
  const user = useAuthStore((state) => state.user);
  const userPermissions = useMemo(() => user?.permissions || [], [user]);

  // Read allowances are used only for page-level access guards
  const canViewAll = userPermissions.includes(PERM.VIEW_ALL_BATCH_TEMPLATES);
  const canViewOwn = userPermissions.includes(PERM.VIEW_OWN_BATCH_TEMPLATES);

  // Gating controls for management visibility
  const canCreateJobs = userPermissions.includes(PERM.CREATE_BATCH_TEMPLATES);

  // --- STATE MANAGEMENT ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    by_status: { active: 0, failed: 0, paused: 0, completed: 0 },
    performance: { completion_rate: 0 },
  });

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    // Structural Guard: If user lacks any batch template reading visibility, block engine requests
    if (!canViewAll && !canViewOwn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filters = { search: searchQuery, status: statusFilter };
      const response = await batchJobsService.getJobs(
        pagination.current_page,
        pagination.per_page,
        filters,
      );

      if (response) {
        // Direct Assignment: trust the scoped dataset supplied by the backend gateway
        setData(response.data || []);
        setPagination({
          current_page: response.current_page,
          total: response.total,
          last_page: response.last_page,
          per_page: response.per_page,
          from: response.from || 0,
          to: response.to || 0,
        });
      }

      const statsRes = await batchJobsService.getStats();
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      showToast("Failed to load batch jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current_page,
    pagination.per_page,
    searchQuery,
    statusFilter,
    showToast,
    canViewAll,
    canViewOwn,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- TABLE CONFIGURATION ---
  const columns = [
    {
      header: "Job Name",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-600">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-slate-900">{item.name}</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider">
              {item.job_specific_config?.command || "Generic Job"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Target Instance",
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">
              {item.provider_instance?.name}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-medium">
              {item.provider_instance?.category_slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Data Source",
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">
            {item.data_source?.name}
          </span>
        </div>
      ),
    },
    {
      header: "Schedule",
      accessor: (item: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-xs font-mono font-bold text-slate-600">
              {item.cron_expression || "Manual"}
            </span>
          </div>
          {item.is_scheduled && (
            <span
              className={cn(
                "text-[9px] font-black uppercase px-1.5 py-0.5 rounded border w-fit",
                item.schedule_active
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-slate-50 text-slate-400 border-slate-100",
              )}
            >
              {item.schedule_active ? "Active" : "Paused"}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item: any) => {
        const variants: any = {
          completed: "bg-green-50 text-green-700 border-green-100",
          active: "bg-blue-50 text-blue-700 border-blue-100 animate-pulse",
          failed: "bg-red-50 text-red-700 border-red-100",
          paused: "bg-amber-50 text-amber-700 border-amber-100",
        };
        return (
          <span
            className={cn(
              "px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
              variants[item.status] || "bg-slate-50",
            )}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Execution Timeline",
      accessor: (item: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase w-8">
              Last:
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {item.updated_at
                ? new Date(item.updated_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "---"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-indigo-400 uppercase w-8">
              Next:
            </span>
            <span className="text-xs text-indigo-600 font-bold">
              {item.next_run_at
                ? new Date(item.next_run_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "---"}
            </span>
          </div>
        </div>
      ),
    },
  ];

  // Action mutations can continue using contextual checks for extra click protection
  const verifyActionManagementAccess = (item: any): boolean => {
    if (userPermissions.includes(PERM.MANAGE_ALL_BATCH_TEMPLATES)) return true;

    const isOwner =
      String(item?.user_id || item?.created_by_id) === String(user?.id);
    if (isOwner && userPermissions.includes(PERM.MANAGE_OWN_BATCH_TEMPLATES)) {
      return true;
    }
    return false;
  };

  const actions = [
    {
      label: "View Details",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (item: any) => navigate(`/batch-jobs/${item.id}`),
    },
    {
      label: "Pause Batch Job",
      icon: <Clock className="h-3.5 w-3.5" />,
      onClick: (item: any) => {
        showToast("Batch job paused successfully", "success");
      },
      hidden: (item: any) =>
        item.status !== "active" || !verifyActionManagementAccess(item),
    },
    {
      label: "Resume Batch Job",
      icon: <Play className="h-3.5 w-3.5" />,
      onClick: (item: any) => {
        showToast("Batch job resumed successfully", "success");
      },
      hidden: (item: any) =>
        item.status !== "paused" || !verifyActionManagementAccess(item),
    },
    {
      label: "Stop Batch Job",
      icon: <XCircle className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      onClick: () => showToast("Stopping batch job...", "success"),
      hidden: (item: any) =>
        !["active", "paused"].includes(item.status) ||
        !verifyActionManagementAccess(item),
    },
    {
      label: "Clone Batch Job",
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => showToast("Job cloned to templates", "success"),
      hidden: () => !userPermissions.includes(PERM.CREATE_BATCH_TEMPLATES),
    },
    {
      label: "Delete",
      variant: "danger" as const,
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (item: any) => {
        showToast("Batch execution profile deleted", "success");
      },
      hidden: (item: any) =>
        !verifyActionManagementAccess(item) ||
        !userPermissions.includes(PERM.DELETE_BATCH_TEMPLATES),
    },
  ];

  const filterConfigs = [
    {
      id: "status",
      label: "All Statuses",
      value: statusFilter,
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Paused", value: "paused" },
      ],
      onChange: (val: string) => {
        setStatusFilter(val);
        setPagination((prev) => ({ ...prev, current_page: 1 }));
      },
    },
  ];

  if (!canViewAll && !canViewOwn) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Access Denied: Insufficient application privileges to view batch
        operations.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[
          {
            label: "Total Batches",
            value: stats.total,
            icon: Layers,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Completed",
            value: stats.by_status.completed,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Active",
            value: stats.by_status.active,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Failed",
            value: stats.by_status.failed,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Paused",
            value: stats.by_status.paused,
            icon: Play,
            color: "text-amber-600",
            bg: "bg-amber-50",
            rotate: "rotate-90",
          },
          {
            label: "Success Rate",
            value: `${stats.performance.completion_rate}%`,
            icon: CheckCircle2,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-colors"
          >
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color, stat.rotate)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN TABLE */}
      <GenericDataTable
        title="Batch Operations"
        subtitle="Manage large-scale executions and automated command templates."
        data={data}
        isLoading={loading}
        columns={columns}
        actions={actions}
        pagination={pagination}
        filters={filterConfigs}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, current_page: page }))
        }
        onPageSizeChange={(size) =>
          setPagination((prev) => ({
            ...prev,
            per_page: size,
            current_page: 1,
          }))
        }
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPagination((prev) => ({ ...prev, current_page: 1 }));
        }}
        showAdd={canCreateJobs}
        onAddClick={() => navigate("/batch-jobs/create")}
      />
    </div>
  );
}
