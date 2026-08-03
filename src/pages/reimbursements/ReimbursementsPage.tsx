import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  DollarSign,
  Ban,
  Cpu,
  User,
  Activity,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";
import {
  reimbursementsService,
  type ReimbursementFilters,
} from "@/services/reimbursementsService";

export default function ReimbursementsPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  // Permissions & Auth
  const user = useAuthStore((state) => state.user);
  const userPermissions = useMemo(() => user?.permissions || [], [user]);

  const canViewAll = useMemo(
    () => userPermissions.includes(PERM.VIEW_ALL_REIMBURSEMENTS),
    [userPermissions],
  );
  const canViewOwn = useMemo(
    () => userPermissions.includes(PERM.VIEW_OWN_REIMBURSEMENTS),
    [userPermissions],
  );

  const canCreateReimbursement = useMemo(
    () =>
      userPermissions.includes(PERM.CREATE_SINGLE_REIMBURSEMENTS) ||
      userPermissions.includes(PERM.CREATE_BULK_REIMBURSEMENTS),
    [userPermissions],
  );

  // States
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tierFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const [reviewedByFilter, setReviewedByFilter] = useState<string>("");

  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");

  const [requesters, setRequesters] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [reviewers, setReviewers] = useState<{ id: number; name: string }[]>(
    [],
  );

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
    by_status: {
      pending: 0,
      approved: 0,
      success: 0,
      rejected: 0,
      failed: 0,
      cancelled: 0,
    },
    performance: { success_rate: 0 },
  });

  // Data Loading Lifecycle
  const fetchData = useCallback(async () => {
    if (!canViewAll && !canViewOwn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filters: ReimbursementFilters = {
        search: searchQuery,
        status: (statusFilter as any) || undefined,
        reimbursement_type: (typeFilter as any) || undefined,
        required_tier: tierFilter ? Number(tierFilter) : undefined,
        reimbursement_mode: (modeFilter as any) || undefined,
        created_by: createdByFilter || undefined,
        reviewed_by: reviewedByFilter || undefined,
        created_at_start: createdAtStart || undefined,
        created_at_end: createdAtEnd || undefined,
      };

      const [response, statsRes] = await Promise.all([
        reimbursementsService.getReimbursements(
          pagination.current_page,
          pagination.per_page,
          filters,
        ),
        reimbursementsService.getStats(),
      ]);

      if (response) {
        const rawResponse = response as any;
        const records =
          rawResponse.data &&
          typeof rawResponse.data === "object" &&
          Array.isArray(rawResponse.data.data)
            ? rawResponse.data.data
            : Array.isArray(rawResponse.data)
              ? rawResponse.data
              : [];

        setData(records);

        const meta = rawResponse.meta || rawResponse.data?.meta || rawResponse;
        setPagination((prev) => ({
          ...prev,
          current_page: meta?.current_page || 1,
          total: meta?.total || 0,
          last_page: meta?.last_page || 1,
          per_page: meta?.per_page || 10,
          from: meta?.from || 0,
          to: meta?.to || 0,
        }));
      }

      if (statsRes?.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      showToast("Failed to load reimbursements", "error");
    } finally {
      setLoading(false);
    }
  }, [
    canViewAll,
    canViewOwn,
    pagination.current_page,
    pagination.per_page,
    searchQuery,
    statusFilter,
    typeFilter,
    tierFilter,
    modeFilter,
    createdByFilter,
    reviewedByFilter,
    createdAtStart,
    createdAtEnd,
    showToast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let isMounted = true;
    const loadFilters = async () => {
      try {
        const [creatorsRes, reviewersRes] = await Promise.all([
          reimbursementsService.getCreators(),
          reimbursementsService.getReviewers(),
        ]);
        if (isMounted) {
          setRequesters(creatorsRes.data || []);
          setReviewers(reviewersRes.data || []);
        }
      } catch (error) {
        console.error("Failed loading reimbursement filters", error);
      }
    };

    loadFilters();
    return () => {
      isMounted = false;
    };
  }, []);

  const tableFilters = useMemo(
    () => [
      {
        id: "status",
        custom: (
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((p) => ({ ...p, current_page: 1 }));
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 h-9"
          >
            <option value="">All Statuses</option>
            <optgroup label="Workflow Status">
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </optgroup>
            <optgroup label="Approval & Fulfillment">
              <option value="approved">Approved (All)</option>
              <option value="queued">Approved & Provisioning Queued</option>
              <option value="success">Approved & Fulfilled (Success)</option>
              <option value="failed">Approved & Provisioning Failed</option>
            </optgroup>
          </select>
        ),
      },
      {
        id: "type",
        custom: (
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((p) => ({ ...p, current_page: 1 }));
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 h-9"
          >
            <option value="">All Resource Types</option>
            <option value="AIRTIME">Airtime Topups</option>
            <option value="BUNDLE">Data/Bundle Packages</option>
          </select>
        ),
      },
      {
        id: "creator",
        custom: (
          <select
            value={createdByFilter}
            onChange={(e) => {
              setCreatedByFilter(e.target.value);
              setPagination((p) => ({ ...p, current_page: 1 }));
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 h-9"
          >
            <option value="">All Requesters</option>
            {requesters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "reviewer",
        custom: (
          <select
            value={reviewedByFilter}
            onChange={(e) => {
              setReviewedByFilter(e.target.value);
              setPagination((p) => ({ ...p, current_page: 1 }));
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 h-9"
          >
            <option value="">All Reviewers</option>
            {reviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "mode",
        custom: (
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPagination((p) => ({ ...p, current_page: 1 }));
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 h-9"
          >
            <option value="">All Execution Modes</option>
            <option value="AUTO">Automated (AUTO)</option>
            <option value="MANUAL">Manual Processing</option>
          </select>
        ),
      },
      {
        id: "date-range",
        custom: (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 h-9">
            <Calendar className="h-3 w-3 text-slate-400 mr-1" />
            <input
              type="date"
              value={createdAtStart}
              onChange={(e) => {
                setCreatedAtStart(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="bg-transparent text-[11px] outline-none"
            />
            <span className="text-[10px]">to</span>
            <input
              type="date"
              value={createdAtEnd}
              onChange={(e) => {
                setCreatedAtEnd(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="bg-transparent text-[11px] outline-none"
            />
          </div>
        ),
      },
    ],
    [
      statusFilter,
      typeFilter,
      createdByFilter,
      reviewedByFilter,
      modeFilter,
      createdAtStart,
      createdAtEnd,
      requesters,
      reviewers,
    ],
  );

  // Table Columns Setup
  const columns = useMemo(
    () => [
      {
        header: "Ticket Context",
        accessor: (item: any) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-bold text-slate-900">
                {item.ticket_id}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                {item.reimbursement_type || "BUNDLE"}
              </span>
              {item.description && (
                <span className="block text-[11px] text-slate-500 max-w-xs truncate mt-0.5 italic">
                  "{item.description}"
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Target Subscriber",
        accessor: (item: any) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">
              {item.msisdn || "Batch Distribution"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {item.is_bulk ? "Batch File Processing" : "Single Account Input"}
            </span>
          </div>
        ),
      },
      {
        header: "Bundle / Airtime",
        accessor: (item: any) => {
          // Resolve item description depending on distribution mode & product configuration
          let displayItemName = "";
          if (item.distribution_mode === "MANY_MANY") {
            displayItemName = "Dynamic Batch Packages";
          } else if (item.bundle?.name) {
            displayItemName = item.bundle.name;
          } else if (item.amount !== undefined && item.amount !== null) {
            displayItemName = `${item.amount} Airtime`;
          } else {
            displayItemName = "Multiple Target Products";
          }

          return (
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-600">
                {displayItemName}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border",
                  item.reimbursement_mode === "AUTO"
                    ? "bg-purple-50 text-purple-600 border-purple-100"
                    : "bg-orange-50 text-orange-600 border-orange-100",
                )}
              >
                {item.reimbursement_mode === "AUTO" ? (
                  <Cpu className="h-2.5 w-2.5" />
                ) : (
                  <User className="h-2.5 w-2.5" />
                )}
                {item.reimbursement_mode || "AUTO"}
              </span>
            </div>
          );
        },
      },
      {
        header: "Status & Execution",
        accessor: (item: any) => {
          const approvalVariants: Record<string, string> = {
            pending: "bg-blue-50 text-blue-700 border-blue-200",
            approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
            rejected: "bg-rose-50 text-rose-700 border-rose-200",
            cancelled: "bg-slate-50 text-slate-700 border-slate-200",
          };

          const provisioningVariants: Record<
            string,
            { label: string; style: string }
          > = {
            SUCCESS: {
              label: "Fulfilled",
              style:
                "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
            },
            FAILED: {
              label: "Provisioning Failed",
              style:
                "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
            },
            IN_PROGRESS: {
              label: "Provisioning...",
              style:
                "bg-purple-50 text-purple-700 border-purple-200 animate-pulse",
            },
            PENDING: {
              label: "Queued",
              style: "bg-slate-100 text-slate-700 border-slate-200",
            },
          };

          const provInfo = item.provisioning_status
            ? provisioningVariants[item.provisioning_status]
            : null;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* If item is approved and has a execution/provisioning state, display the provisioning badge instead of redundant APPROVED badge */}
              {item.status === "approved" && provInfo ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border font-bold uppercase tracking-wider",
                    provInfo.style,
                  )}
                >
                  <Cpu className="h-2.5 w-2.5" />
                  {provInfo.label}
                </span>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                    approvalVariants[item.status] ||
                      "bg-slate-50 text-slate-600",
                  )}
                >
                  {item.status}
                </span>
              )}

              {item.status === "rejected" && item.rejection_reason && (
                <span className="text-[10px] text-rose-600 font-medium max-w-[180px] truncate">
                  Reason: {item.rejection_reason}
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Creation Date",
        accessor: (item: any) => (
          <span className="text-xs text-slate-600 font-medium">
            {item.created_at
              ? new Date(item.created_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "---"}
          </span>
        ),
      },
      {
        header: "Requested By",
        accessor: (item: any) => (
          <span className="text-xs text-slate-600 font-medium">
            {item.requester_name || "---"}
          </span>
        ),
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      {
        label: "View Request Details",
        icon: <Eye className="h-3.5 w-3.5" />,
        onClick: (item: any) => navigate(`/reimbursements/${item.id}`),
      },
    ],
    [navigate],
  );

  if (!canViewAll && !canViewOwn) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Access Denied: Insufficient application privileges to view reimbursement
        operations.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[
          {
            label: "Total Requests",
            value: stats.total,
            icon: Layers,
            color: "text-slate-600",
            bg: "bg-slate-50",
          },
          {
            label: "Provisioned (Success)",
            value: stats.by_status?.success || 0,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Pending Review",
            value: stats.by_status?.pending || 0,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Rejected By Ops",
            value: stats.by_status?.rejected || 0,
            icon: Ban,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
          {
            label: "System Failures",
            value: stats.by_status?.failed || 0,
            icon: XCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Fulfillment Rate",
            value: `${stats.performance?.success_rate || 0}%`,
            icon: Activity,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-indigo-100 transition-colors"
          >
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
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

      <GenericDataTable
        title="Reimbursements"
        data={data}
        columns={columns}
        actions={actions}
        filters={tableFilters}
        pagination={pagination}
        searchPlaceholder="Search by Ticket ID or MSISDN..."
        searchWidth="w-full md:w-64"
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPagination((prev) => ({ ...prev, current_page: 1 }));
        }}
        isLoading={loading}
        showAdd={canCreateReimbursement}
        onAddClick={() => navigate("/reimbursements/create")}
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
      />
    </div>
  );
}
