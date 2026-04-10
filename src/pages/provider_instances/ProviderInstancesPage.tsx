// src/pages/management/ProviderInstancesPage.tsx
import { useEffect, useState } from "react";
import { Server, Edit3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { providerInstanceService } from "@/services/providerInstanceService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/management/DeleteConfirmationModal";

export default function ProviderInstancesPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  });

  // Filter & Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item: any | null;
  }>({
    open: false,
    item: null,
  });

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const filters = { search: searchQuery, category: categoryFilter };
      const response = await providerInstanceService.getAll(
        currentPage,
        pageSize,
        filters,
      );

      if (response && response.data) {
        setInstances(response.data);
        setPagination({
          current_page: response.current_page,
          total: response.total,
          last_page: response.last_page,
          per_page: response.per_page,
        });
      }
    } catch (error) {
      showToast("Failed to load provider instances", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, [currentPage, pageSize, searchQuery, categoryFilter]);

  const columns = [
    {
      header: "Instance Name",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg border",
              item.is_active
                ? "bg-green-50 border-green-100 text-green-600"
                : "bg-slate-50 border-slate-100 text-slate-400",
            )}
          >
            <Server className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-slate-900">{item.name}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {item.category_slug.replace("-", " ")}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Health Status",
      accessor: (item: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                item.is_active ? "bg-green-500 animate-pulse" : "bg-red-500",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-bold uppercase",
                item.is_active ? "text-green-600" : "text-red-600",
              )}
            >
              {item.is_active ? "Connected" : "Disconnected"}
            </span>
          </div>
          {item.last_error_message && (
            <div className="text-[9px] text-red-400 max-w-[180px] truncate font-medium">
              {item.last_error_message}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Endpoint",
      accessor: (item: any) => (
        <span className="text-xs font-mono text-slate-500">
          {item.connection_settings.host}:
          {item.connection_settings.port || "SSL"}
        </span>
      ),
    },
    {
      header: "TPS Limit",
      accessor: (item: any) => (
        <span className="text-xs font-bold text-slate-600">
          {item.tps_limit || "N/A"}
        </span>
      ),
    },
    {
      header: "latency (ms)",
      accessor: (item: any) => (
        <span className="text-xs font-bold text-slate-600">
          {item.latency_ms !== null ? item.latency_ms : "N/A"}
        </span>
      ),
    },
  ];

  const filterConfigs = [
    {
      id: "category",
      label: "All Categories",
      value: categoryFilter,
      options: [
        { label: "Ericsson UCIP", value: "ericsson-ucip" },
        { label: "Ericsson CAI", value: "ericsson-cai" },
        { label: "LEAP REST", value: "leap" },
        { label: "SMSC", value: "smsc" },
      ],
      onChange: (val: string) => {
        setCategoryFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  const actions = [
    {
      label: "Edit Instance",
      icon: <Edit3 className="h-3.5 w-3.5" />,
      onClick: (item: any) => navigate(`/providers-instances/${item.id}`),
    },
    {
      label: "Delete Instance",
      variant: "danger" as const,
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (item: any) => setDeleteModal({ open: true, item }),
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <GenericDataTable
        title="Provider Instances"
        subtitle="Manage real-time connectivity to core network elements and external providers."
        data={instances}
        isLoading={loading}
        columns={columns}
        actions={actions}
        pagination={pagination}
        filters={filterConfigs}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        onAddClick={() => navigate("/providers-instances/create")}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        title="Delete Provider Instance"
        entityName={deleteModal.item?.name || ""}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={async () => {
          await providerInstanceService.delete(deleteModal.item.id);
          showToast("Instance removed successfully", "success");
          fetchInstances();
        }}
        description={undefined}
      />
    </div>
  );
}
