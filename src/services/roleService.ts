import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/paginatedResponse";
import type { Permission, Role, RoleUpdatePayload } from "@/types/roles";

export interface RoleFilters {
  name?: string;
  search?: string;
}

export const roleAndPermissionsService = {
  getAllRoles: async (
    page: number = 1,
    perPage: number = 15,
    filters?: RoleFilters,
  ): Promise<PaginatedResponse<Role>> => {
    try {
      const response = await api.get(`/management/roles`, {
        params: {
          page,
          per_page: perPage,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("RoleAndPermissionsService.getAllRoles failed:", error);
      throw error;
    }
  },

  /**
   * Fetch all roles with counts (for the DataGrid)
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get("/management/roles");
    return response.data;
  },

  /**
   * Fetch a single role with its assigned permissions
   */
  getRoleById: async (id: number | string): Promise<Role> => {
    const response = await api.get(`/management/roles/${id}`);
    return response.data;
  },

  /**
   * Fetch the full list of permissions available in the system
   * categorized by the backend
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await api.get("/management/permissions");
    return response.data;
  },

  /**
   * Create a new security role
   */
  createRole: async (payload: RoleUpdatePayload): Promise<Role> => {
    const response = await api.post("/management/roles", payload);
    return response.data;
  },

  /**
   * Update an existing role and sync its permissions
   */
  updateRole: async (
    id: number | string,
    payload: RoleUpdatePayload,
  ): Promise<Role> => {
    const response = await api.put(`/management/roles/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a role from the system
   */
  deleteRole: async (id: number | string): Promise<void> => {
    await api.delete(`/management/roles/${id}`);
  },
};
