// /var/www/html/uap-frontend/src/pages/roles/RolesPage.tsx
import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, Users, EyeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GenericDataTable } from "@/components/ui/GenericDataTable";
import DeleteConfirmationModal from "@/components/management/DeleteConfirmationModal";
import { roleAndPermissionsService } from "@/services/roleService";
import { useToastStore } from "@/hooks/useToastStore";
import { PERM } from "@/types/auth"; // Import global authorization permissions

export default function RolesPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    role: any | null;
  }>({ open: false, role: null });

  const fetchRoles = async (page: number, limit: number, search: string) => {
    setLoading(true);
    try {
      const response = await roleAndPermissionsService.getAllRoles(
        page,
        limit,
        { search },
      );

      if (response && typeof response === "object" && "data" in response) {
        setRoles(response.data);
        setPagination({
          current_page: response.current_page,
          total: response.total,
          from: response.from,
          to: response.to,
          last_page: response.last_page,
          per_page: response.per_page,
        });
      } else if (Array.isArray(response)) {
        setRoles(response);
        setPagination(null);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      showToast("Could not load security roles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(currentPage, pageSize, searchQuery);
  }, [currentPage, pageSize, searchQuery]);

  const columns = [
    {
      header: "Role Name",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Permissions",
      accessor: (item: any) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold">
          {item.permissions?.length || 0} Privileges
        </span>
      ),
    },
    {
      header: "Users Assigned",
      accessor: (item: any) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {item.users_count || 0} Users
          </span>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "View Role",
      icon: <EyeIcon className="h-3.5 w-3.5" />,
      onClick: (item: any) => navigate(`/roles/${item.id}`),
      // Require VIEW_ROLES privilege tokens to let users inspect configurations
      permissions: [PERM.VIEW_ROLES, PERM.EDIT_ROLES],
    },
    {
      label: "Delete Role",
      variant: "danger" as const,
      icon: <Trash2 className="h-3.5 w-3.5" />,
      hidden: (item: any) => item.id === 1, // Safe fallback restriction for Master Admin role
      onClick: (item: any) => setDeleteModal({ open: true, role: item }),
      // Require explicit DELETE_ROLES permission context rules
      permissions: [PERM.DELETE_ROLES],
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <GenericDataTable
        title="Roles & Permissions"
        subtitle="Define security levels and assign granular permissions to user groups."
        data={roles}
        isLoading={loading}
        columns={columns}
        actions={actions}
        pagination={pagination}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onSearchChange={(val) => setSearchQuery(val)}
        searchPlaceholder="Search roles..."
        onAddClick={() => navigate("/roles/create")}
        /* Guard addition privileges explicitly using the view-level definition tokens */
        addPermission={PERM.CREATE_ROLES}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        title="Delete Security Role"
        entityName={deleteModal.role?.name || ""}
        description={
          <p>
            You are deleting <b>{deleteModal.role?.name}</b>. This will remove
            all associated permissions. Users assigned to this role may lose
            access to restricted features.
          </p>
        }
        onClose={() => setDeleteModal({ open: false, role: null })}
        onConfirm={async () => {
          if (deleteModal.role) {
            try {
              await roleAndPermissionsService.deleteRole(deleteModal.role.id);
              showToast("Security role deleted successfully", "success");
              fetchRoles(currentPage, pageSize, searchQuery);
            } catch (error: any) {
              showToast(
                error.response?.data?.message || "Failed to delete role",
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
