import { useState, useEffect } from "react";
import { Edit2, Key, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types/users";
import { userService } from "@/services/userService";
import { roleAndPermissionsService } from "@/services/roleService";
import UserFormModal from "@/components/management/UserFormModal";
import { useToastStore } from "@/hooks/useToastStore";
import ResetPasswordModal from "@/components/management/ResetPasswordModal";
import {
  GenericDataTable,
  type Column,
  type FilterConfig,
} from "@/components/ui/GenericDataTable";
import DeleteConfirmationModal from "@/components/management/DeleteConfirmationModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: any }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "blocked" | "">(
    "",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showToast } = useToastStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const fetchUsers = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(page, limit, {
        role: roleFilter,
        status: statusFilter || undefined,
        search: searchQuery,
      });

      setUsers(response.data);
      setPagination({
        current_page: response.current_page,
        total: response.total,
        from: response.from,
        to: response.to,
        last_page: response.last_page,
        per_page: response.per_page,
      });
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const fetchRoles = async () => {
    try {
      const roles = await roleAndPermissionsService.getAllRoles();
      const formattedRoles = roles.data.map((role: any) => ({
        label: capitalizeFirstLetter(role.name),
        value: role.id,
      }));
      setRoleOptions(formattedRoles);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, pageSize);
    fetchRoles();
  }, [currentPage, pageSize, roleFilter, statusFilter, searchQuery]);

  const handleFilterChange = <T extends string>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: T,
  ) => {
    setter(value);
  };

  const userFilters: FilterConfig[] = [
    {
      label: "Role",
      value: roleFilter,
      onChange: (val) => handleFilterChange(setRoleFilter, val),
      options: roleOptions,
    },
    {
      label: "Status",
      value: statusFilter,
      onChange: (val) =>
        handleFilterChange(
          setStatusFilter,
          (val === "active" ? "active" : val === "blocked" ? "blocked" : "") as
            | ""
            | "active"
            | "blocked",
        ),
      options: [
        { label: "Active", value: "active" },
        { label: "Blocked", value: "blocked" },
      ],
    },
  ];

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleToggleBlock = async (user: User) => {
    try {
      if (user.is_blocked) {
        await userService.unblockUser(user.id);
        showToast(`${user.name} has been unblocked.`, "success");
      } else {
        await userService.blockUser(user.id);
        showToast(`${user.name} has been blocked.`, "success");
      }
      fetchUsers(currentPage, pageSize);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleResetPassword = (user: User) => {
    setUserToReset(user);
    setIsResetModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const actions = [
    {
      label: "Edit User",
      icon: <Edit2 className="h-3.5 w-3.5" />,
      onClick: handleEdit,
    },
    {
      label: (user: User) => (user.is_blocked ? "Unblock User" : "Block User"),
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      onClick: handleToggleBlock,
    },
    {
      label: "Reset Password",
      icon: <Key className="h-3.5 w-3.5" />,
      onClick: handleResetPassword,
    },
    {
      label: "Delete Account",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      onClick: handleDelete,
    },
  ];

  const columns: Column<User>[] = [
    {
      header: "User Details",
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-none">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <ShieldCheck
            className={cn(
              "h-3.5 w-3.5",
              user.role === "Administrator"
                ? "text-indigo-500"
                : "text-slate-400",
            )}
          />
          <span className="font-medium text-slate-600">
            {capitalizeFirstLetter(user.role)}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (user: User) => (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
            user.is_blocked === false
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-slate-50 text-slate-500 border-slate-100",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full mr-1.5",
              user.is_blocked === true ? "bg-slate-300" : "bg-green-500",
            )}
          />
          {user.is_blocked === true ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      header: "Joined Date",
      accessor: (user: User) => new Date(user.created_at).toLocaleDateString(),
      className: "text-slate-500",
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <GenericDataTable
        title="User Management"
        subtitle="Manage platform access, roles, and security permissions for your team."
        data={users}
        isLoading={loading}
        actions={actions}
        columns={columns}
        pagination={pagination}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onSearchChange={(val) => handleFilterChange(setSearchQuery, val)}
        filters={userFilters}
        searchPlaceholder="Search by name or email..."
        onAddClick={() => {
          setModalMode("create");
          setIsModalOpen(true);
        }}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        mode={modalMode}
        initialData={selectedUser}
        onSuccess={() => fetchUsers(currentPage, pageSize)}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Delete User Account"
        entityName={userToDelete?.name || ""}
        description={
          <p>
            You are about to permanently delete <b>{userToDelete?.name}</b>.
            This action will revoke all access and cannot be undone.
          </p>
        }
        onConfirm={async () => {
          if (userToDelete) {
            try {
              await userService.deleteUser(userToDelete.id);
              showToast("User deleted successfully", "success");
              fetchUsers(currentPage, pageSize);
            } catch (error: any) {
              showToast(
                error.response?.data?.message || "Failed to delete user",
                "error",
              );
              // Throw the error so the modal's loading state can stop
              throw error;
            }
          }
        }}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setUserToReset(null);
        }}
        user={userToReset}
      />
    </div>
  );
}
