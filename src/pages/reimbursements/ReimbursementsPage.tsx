import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  DollarSign,
  ThumbsUp,
  Ban,
  Paperclip,
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

  // --- AUTH & PERMISSIONS CONTROLS ---
  const user = useAuthStore((state) => state.user);
  const userPermissions = useMemo(() => user?.permissions || [], [user]);

  const canViewAll = userPermissions.includes(PERM.VIEW_ALL_REIMBURSEMENTS);
  const canViewOwn = userPermissions.includes(PERM.VIEW_OWN_REIMBURSEMENTS);

  const canCreateReimbursement =
    userPermissions.includes(PERM.CREATE_SINGLE_REIMBURSEMENTS) ||
    userPermissions.includes(PERM.CREATE_BULK_REIMBURSEMENTS);

  // --- EXPANDED STATE MANAGEMENT ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  // Creation Date Range Filter Boundaries
  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");

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
    by_status: { pending: 0, approved: 0, success: 0, rejected: 0, failed: 0 },
    performance: { success_rate: 0 },
  });

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    if (!canViewAll && !canViewOwn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Mapping comprehensive filters seamlessly onto api transmission layer
      const filters: ReimbursementFilters = {
        search: searchQuery,
        status: (statusFilter as any) || undefined,
        reimbursement_type: (typeFilter as any) || undefined,
        required_tier: tierFilter ? Number(tierFilter) : undefined,
        reimbursement_mode: (modeFilter as any) || undefined,
        created_at_start: createdAtStart || undefined,
        created_at_end: createdAtEnd || undefined,
      };

      // If search query looks like an exact MSISDN, feed it into the structured parameter field
      if (/^\d+$/.test(searchQuery)) {
        filters.msisdn = searchQuery;
      }

      const response = await reimbursementsService.getReimbursements(
        pagination.current_page,
        pagination.per_page,
        filters,
      );

      if (response) {
        // Cast response to any temporarily so TypeScript allows checking your nested backend fields
        const rawResponse = response as any;

        // Extract the true array records safely
        const records =
          rawResponse.data &&
          typeof rawResponse.data === "object" &&
          Array.isArray(rawResponse.data.data)
            ? rawResponse.data.data
            : Array.isArray(rawResponse.data)
              ? rawResponse.data
              : [];

        setData(records);

        // Extract pagination meta safely wherever your backend paginator nested them
        const meta = rawResponse.meta || rawResponse.data?.meta || rawResponse;

        setPagination({
          current_page: meta?.current_page || 1,
          total: meta?.total || 0,
          last_page: meta?.last_page || 1,
          per_page: meta?.per_page || 10,
          from: meta?.from || 0,
          to: meta?.to || 0,
        });
      }

      const statsRes = await reimbursementsService.getStats();
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      showToast("Failed to load reimbursements", "error");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current_page,
    pagination.per_page,
    searchQuery,
    statusFilter,
    typeFilter,
    tierFilter,
    modeFilter,
    createdAtStart,
    createdAtEnd,
    showToast,
    canViewAll,
    canViewOwn,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- TABLE COLUMN CONFIGURATION ---
  const columns = [
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
            {item.msisdn}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {item.is_bulk ? "Batch File Processing" : "Single Account Input"}
          </span>
        </div>
      ),
    },
    {
      header: "Asset & Processing Mode",
      accessor: (item: any) => (
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600">
            {item.target_product_id || `${item.amount} Airtime`}
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
      ),
    },
    {
      header: "Approval Structure",
      accessor: (item: any) => (
        <div className="space-y-1">
          <span className="block text-[10px] font-black uppercase px-1.5 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-100 w-fit">
            Tier {item.required_tier || "1"} Approval
          </span>
          {item.attachments?.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Paperclip className="h-3 w-3" />
              <span>{item.attachments.length} attachment(s)</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item: any) => {
        const variants: any = {
          success:
            "bg-emerald-100 text-emerald-800 border-emerald-200 font-black",
          approved: "bg-green-50 text-green-700 border-green-100",
          pending: "bg-blue-50 text-blue-700 border-blue-100 animate-pulse",
          rejected: "bg-red-50 text-red-700 border-red-100",
          failed: "bg-amber-50 text-amber-700 border-amber-100",
        };
        return (
          <div className="space-y-1">
            <span
              className={cn(
                "inline-block px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                variants[item.status] || "bg-slate-50",
              )}
            >
              {item.status === "success" ? "✓ Provisioned" : item.status}
            </span>
            {item.status === "rejected" && item.rejection_reason && (
              <span className="block text-[10px] text-red-500 font-medium max-w-[180px] break-words">
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
  ];

  // --- ACTIONS CONTROLLER & SECURITY ENFORCEMENT ---
  const verifyApprovalPrivileges = (item: any): boolean => {
    const isMaker = String(item?.requested_by_user_id) === String(user?.id);
    if (isMaker) return false;

    if (item.required_tier === 3)
      return userPermissions.includes(PERM.APPROVE_TIER3_REIMBURSEMENTS);
    if (item.required_tier === 2)
      return userPermissions.includes(PERM.APPROVE_TIER2_REIMBURSEMENTS);
    return userPermissions.includes(PERM.APPROVE_TIER1_REIMBURSEMENTS);
  };

  const actions = [
    {
      label: "View Request Details",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (item: any) => navigate(`/reimbursements/${item.id}`),
    },
  ];

  // Multi-selector configuration mapped directly into GenericDataTable select layers

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
      {/* 6-COLUMN DASHBOARD COUNTER METRICS */}
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

      {/* COMPONENT INVOCATION LINKED TO ALL MULTI-SELECT FILTER CONFIGS */}
      <GenericDataTable
        title="Reimbursement Ledgers"
        subtitle="Track, audit, and approve single and bulk subscriber resource provisioning modifications."
        data={data}
        columns={columns}
        actions={actions}
        pagination={pagination}
        searchPlaceholder="Search by Ticket ID or MSISDN..."
        searchWidth="w-full md:w-64" // Give the search bar a defined desktop space so filters can sit cleanly next to it
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
        filterContent={
          <div className="flex flex-wrap items-center gap-2">
            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300 transition-colors cursor-pointer h-9"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved Queue</option>
              <option value="success">Provisioned Successfully</option>
              <option value="rejected">Rejected Requests</option>
              <option value="failed">System Failed</option>
            </select>

            {/* TYPE */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300 transition-colors cursor-pointer h-9"
            >
              <option value="">All Resource Types</option>
              <option value="AIRTIME">Airtime Topups</option>
              <option value="BUNDLE">Data/Bundle Packages</option>
            </select>

            {/* TIER */}
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300 transition-colors cursor-pointer h-9"
            >
              <option value="">All Approval Tiers</option>
              <option value="1">Tier 1 Clearance</option>
              <option value="2">Tier 2 Clearance</option>
              <option value="3">Tier 3 Clearance</option>
            </select>

            {/* MODE */}
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none hover:border-slate-300 transition-colors cursor-pointer h-9"
            >
              <option value="">All Execution Modes</option>
              <option value="AUTO">Automated (AUTO)</option>
              <option value="MANUAL">Manual Processing</option>
            </select>

            {/* DATE RANGE CONTROLS */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 h-9">
              <Calendar className="h-3 w-3 text-slate-400 mr-1" />
              <input
                type="date"
                value={createdAtStart}
                onChange={(e) => {
                  setCreatedAtStart(e.target.value);
                  setPagination((p) => ({ ...p, current_page: 1 }));
                }}
                className="bg-transparent text-[11px] font-medium text-slate-600 outline-none cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase px-1">
                to
              </span>
              <input
                type="date"
                value={createdAtEnd}
                onChange={(e) => {
                  setCreatedAtEnd(e.target.value);
                  setPagination((p) => ({ ...p, current_page: 1 }));
                }}
                className="bg-transparent text-[11px] font-medium text-slate-600 outline-none cursor-pointer"
              />
            </div>

            {/* CLEAR ACTION BUTTON */}
            {(createdAtStart || createdAtEnd) && (
              <button
                onClick={() => {
                  setCreatedAtStart("");
                  setCreatedAtEnd("");
                  setPagination((p) => ({ ...p, current_page: 1 }));
                }}
                className="h-9 px-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-bold text-[11px] hover:bg-red-100 transition-colors"
              >
                Clear Range
              </button>
            )}
          </div>
        }
      />
    </div>
  );
}
