// src/pages/provisioning-profiles/ProvisioningProfilesPage.tsx

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Cpu,
  Wallet,
  Eye,
  Server,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import { provisioningProfilesService } from "@/services/provisioningProfilesService";

export default function ProvisioningProfilesPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [reimbursementFilter, setReimbursementFilter] = useState("");
  const [executionModeFilter, setExecutionModeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 10,
    last_page: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await provisioningProfilesService.getProfiles(
        pagination.current_page,
        pagination.per_page,
        {
          search: searchQuery,

          reimbursement_type: reimbursementFilter || undefined,

          execution_mode: executionModeFilter || undefined,

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

      showToast("Failed to load provisioning profiles", "error");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current_page,
    pagination.per_page,
    searchQuery,
    reimbursementFilter,
    executionModeFilter,
    activeFilter,
    showToast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tableFilters = [
    {
      id: "reimbursement_type",

      custom: (
        <select
          value={reimbursementFilter}
          onChange={(e) => {
            setReimbursementFilter(e.target.value);

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
          <option value="">All Reimbursement Types</option>

          <option value="BUNDLE">Bundle</option>

          <option value="AIRTIME">Airtime</option>
        </select>
      ),
    },

    {
      id: "execution_mode",

      custom: (
        <select
          value={executionModeFilter}
          onChange={(e) => {
            setExecutionModeFilter(e.target.value);

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
          <option value="">All Execution Modes</option>

          <option value="COMMAND">Command</option>
        </select>
      ),
    },

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

  const columns = [
    {
      header: "Profile",

      accessor: (item: any) => (
        <div
          className="
          flex
          items-center
          gap-3
        "
        >
          <div
            className="
            p-2
            bg-purple-50
            rounded-lg
            border
            border-purple-100
            text-purple-600
          "
          >
            <Cpu className="h-4 w-4" />
          </div>

          <div>
            <span
              className="
              block
              font-bold
              text-slate-900
            "
            >
              {item.name}
            </span>

            <span
              className="
              block
              text-[10px]
              font-mono
              text-slate-400
            "
            >
              ID: {item.id}
            </span>
          </div>
        </div>
      ),
    },

    {
      header: "Reimbursement",

      accessor: (item: any) => (
        <div className="flex flex-col">
          <span
            className="
          text-xs
          font-semibold
          text-slate-700
        "
          >
            {item.reimbursement_type}
          </span>

          {item.reimbursement_type === "BUNDLE" &&
            Array.isArray(item.catalog_product_types) &&
            item.catalog_product_types.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.catalog_product_types.map((category: string) => (
                  <span
                    key={category}
                    className="
                  px-1.5
                  py-0.5
                  rounded
                  bg-indigo-50
                  border
                  border-indigo-100
                  text-indigo-600
                  text-[10px]
                  font-bold
                  uppercase
                "
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
        </div>
      ),
    },

    {
      header: "Execution",

      accessor: (item: any) => (
        <span
          className="
          inline-flex
          items-center
          px-2
          py-0.5
          text-[10px]
          font-bold
          uppercase
          rounded
          border
          bg-indigo-50
          text-indigo-700
          border-indigo-100
        "
        >
          {item.execution_mode}
        </span>
      ),
    },

    {
      header: "Funding Account",

      accessor: (item: any) => (
        <div
          className="
          flex
          items-center
          gap-1.5
          text-xs
          text-slate-600
        "
        >
          <Wallet className="h-3.5 w-3.5" />

          {item.funding_account.name}
        </div>
      ),
    },

    {
      header: "Provider",

      accessor: (item: any) => (
        <div
          className="
          flex
          items-center
          gap-1.5
          text-xs
          text-slate-600
        "
        >
          <Server className="h-3.5 w-3.5" />

          {item.provider_instance.name}
        </div>
      ),
    },

    {
      header: "Status",

      accessor: (item: any) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border",

            item.is_active
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-700 border-red-100",
          )}
        >
          {item.is_active ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}

          {item.is_active ? "Active" : "Disabled"}
        </span>
      ),
    },

    {
      header: "Actions",

      accessor: (item: any) => (
        <button
          onClick={() => navigate(`/provisioning-profiles/${item.id}`)}
          className="
            p-1
            text-slate-400
            hover:text-indigo-600
            hover:bg-slate-50
            rounded-lg
          "
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div
      className="
      p-8
      max-w-[1600px]
      mx-auto
      space-y-6
    "
    >
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
          "
          >
            Provisioning Profiles
          </h1>

          <p
            className="
            text-xs
            text-slate-500
          "
          >
            Configure execution rules and funding mappings.
          </p>
        </div>

        <button
          onClick={() => navigate("/provisioning-profiles/create")}
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
            gap-2
          "
        >
          <Plus className="h-3.5 w-3.5" />
          Create Profile
        </button>
      </div>

      <GenericDataTable
        title=""
        data={data}
        columns={columns}
        filters={tableFilters}
        isLoading={loading}
        searchPlaceholder="Search provisioning profiles..."
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
