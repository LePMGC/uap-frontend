// src/pages/funding-accounts/FundingAccountsPage.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { fundingAccountsService } from "@/services/fundingAccountsService";

export default function FundingAccountsPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 10,
    last_page: 1,
  });

  /**
   * Load funding accounts with filters
   */
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fundingAccountsService.getAccounts(
        pagination.current_page,
        pagination.per_page,
        {
          search: searchQuery,
          is_active: activeFilter === "" ? undefined : activeFilter === "true",
        },
      );

      const page = response.data;

      setData(page.data || []);

      setPagination({
        current_page: page.current_page,
        from: page.from,
        to: page.to,
        total: page.total,
        per_page: page.per_page,
        last_page: page.last_page,
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to load funding accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current_page,
    pagination.per_page,
    searchQuery,
    activeFilter,
    showToast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Filter Configurations Matrix
   */
  const tableFilters = [
    {
      id: "status",
      custom: (
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);

            setPagination((p) => ({
              ...p,
              current_page: 1,
            }));
          }}
          className="
            bg-white
            border
            border-slate-200
            rounded-lg
            px-3
            py-1.5
            text-[11px]
            font-bold
            text-slate-600
            h-9
          "
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      ),
    },
  ];

  /**
   * Table columns
   */
  const columns = [
    {
      header: "Account",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-600">
            <Wallet className="h-4 w-4" />
          </div>

          <div>
            <span className="block font-bold text-slate-900">{item.name}</span>

            <span className="block text-[10px] text-slate-400 font-mono uppercase">
              {item.msisdn}
            </span>
          </div>
        </div>
      ),
    },

    {
      header: "Description",
      accessor: (item: any) => (
        <span className="text-xs text-slate-600">
          {item.description || "-"}
        </span>
      ),
    },

    {
      header: "Status",
      accessor: (item: any) => {
        const active = item.is_active;

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-full border",
              active
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-700 border-red-100",
            )}
          >
            {active ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}

            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },

    {
      header: "Created",
      accessor: (item: any) => (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />

          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "-"}
        </div>
      ),
    },

    {
      header: "Actions",
      accessor: (item: any) => (
        <button
          onClick={() => navigate(`/funding-accounts/${item.id}`)}
          className="
            p-1 
            text-slate-400 
            hover:text-indigo-600 
            hover:bg-slate-50 
            border 
            border-transparent 
            hover:border-slate-200 
            rounded-lg 
            transition-all
          "
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div
        className="
        flex 
        items-center 
        justify-between 
        border-b 
        border-slate-100 
        pb-4
      "
      >
        <div>
          <h1
            className="
            text-xl 
            font-black 
            text-slate-900 
            tracking-tight
          "
          >
            Funding Accounts
          </h1>

          <p
            className="
            text-xs 
            text-slate-500 
            font-medium
          "
          >
            Manage operational funding wallets and source accounts.
          </p>
        </div>

        <button
          onClick={() => navigate("/funding-accounts/create")}
          className="
            h-9 
            px-4 
            bg-indigo-600 
            hover:bg-indigo-700 
            text-white 
            font-bold 
            text-xs 
            rounded-xl 
            flex 
            items-center 
            gap-1.5 
            shadow-sm
          "
        >
          <Plus className="h-3.5 w-3.5" />
          Provision Account
        </button>
      </div>

      <GenericDataTable
        title=""
        data={data}
        columns={columns}
        filters={tableFilters}
        isLoading={loading}
        searchPlaceholder="Search funding accounts..."
        onSearchChange={(value: string) => {
          setSearchQuery(value);

          setPagination((p) => ({
            ...p,
            current_page: 1,
          }));
        }}
        searchWidth="w-full md:w-64"
        pagination={pagination}
        onPageChange={(page: number) =>
          setPagination((p) => ({
            ...p,
            current_page: page,
          }))
        }
        onPageSizeChange={(size: number) =>
          setPagination((p) => ({
            ...p,
            per_page: size,
            current_page: 1,
          }))
        }
      />
    </div>
  );
}
