import { useEffect, useState } from "react";
import {
  Database,
  Upload,
  Server,
  Trash2,
  Globe,
  CheckCircle2,
  XCircle,
  Edit3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import { dataSourceService } from "@/services/dataSourceService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/management/DeleteConfirmationModal";

export default function DataSourcesPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<any>({
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  });

  // Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    dataSource: any | null;
  }>({ open: false, dataSource: null });

  const fetchDataSources = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchQuery,
        type: typeFilter,
        is_active: statusFilter,
      };

      const response = await dataSourceService.getAll(
        currentPage,
        pageSize,
        filters,
      );

      if (response && typeof response === "object" && "data" in response) {
        setDataSources(response.data);
        setPagination({
          current_page: response.current_page,
          total: response.total,
          from: response.from,
          to: response.to,
          last_page: response.last_page,
          per_page: response.per_page,
        });
      }
    } catch (error) {
      showToast("Failed to load data sources", "error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when any filter or pagination state changes
  useEffect(() => {
    fetchDataSources();
  }, [currentPage, pageSize, searchQuery, typeFilter, statusFilter]);

  const columns = [
    {
      header: "Source Name",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            {item.type === "api" && <Globe className="h-4 w-4 text-blue-500" />}
            {item.type === "database" && (
              <Database className="h-4 w-4 text-indigo-500" />
            )}
            {item.type === "sftp" && (
              <Server className="h-4 w-4 text-amber-500" />
            )}
            {item.type === "upload" && (
              <Upload className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <div>
            <span className="block font-bold text-slate-900">{item.name}</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase">
              {item.type}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item: any) => (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            item.is_active
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-slate-50 text-slate-400 border border-slate-100",
          )}
        >
          {item.is_active ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {item.is_active ? "Active" : "Disabled"}
        </div>
      ),
    },
    {
      header: "Created By",
      accessor: (item: any) => (
        <span className="text-xs text-slate-500 font-medium">
          @{item.creator?.username || "system"}
        </span>
      ),
    },
  ];

  // Define filters in the format GenericDataTable expects
  const filterConfigs = [
    {
      id: "type",
      label: "All Types",
      value: typeFilter,
      options: [
        { label: "API", value: "api" },
        { label: "Database", value: "database" },
        { label: "SFTP", value: "sftp" },
        { label: "Upload", value: "upload" },
      ],
      onChange: (val: string) => {
        setTypeFilter(val);
        setCurrentPage(1); // Reset to first page on filter change
      },
    },
    {
      id: "status",
      label: "All Status",
      value: statusFilter,
      options: [
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
      ],
      onChange: (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1); // Reset to first page on filter change
      },
    },
  ];

  const actions = [
    {
      label: "Edit Source",
      icon: <Edit3 className="h-3.5 w-3.5" />,
      onClick: (item: any) => navigate(`/data-sources/${item.id}`),
    },
    {
      label: "Delete Source",
      variant: "danger" as const,
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (item: any) => setDeleteModal({ open: true, dataSource: item }),
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <GenericDataTable
        title="Data Sources"
        subtitle="Manage connections to external APIs, Databases, and File Servers."
        data={dataSources}
        isLoading={loading}
        columns={columns}
        actions={actions}
        pagination={pagination}
        filters={filterConfigs} // Passing the configurations here
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search data sources..."
        onAddClick={() => navigate("/data-sources/create")}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        title="Delete Data Source"
        entityName={deleteModal.dataSource?.name || ""}
        description={
          <p>
            You are deleting <b>{deleteModal.dataSource?.name}</b>. This will
            permanently remove the connection configuration.
          </p>
        }
        onClose={() => setDeleteModal({ open: false, dataSource: null })}
        onConfirm={async () => {
          if (deleteModal.dataSource) {
            try {
              await dataSourceService.deleteDataSource(
                deleteModal.dataSource.id,
              );
              showToast("Data source deleted successfully", "success");
              fetchDataSources();
            } catch (error: any) {
              showToast(
                error.response?.data?.message || "Failed to delete",
                "error",
              );
              throw error;
            }
          }
        }}
      />
    </div>
  );
}
