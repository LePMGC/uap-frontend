import api from "@/lib/api";

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export const roleAndPermissionsService = {
  getAllRoles: async (): Promise<Role[]> => {
    try {
      // Base URL and Token are already handled by the 'api' instance
      const response = await api.get("/management/roles");
      return response.data ?? [];
    } catch (error) {
      console.error("RoleAndPermissionsService.getAllRoles failed:", error);
      return [];
    }
  },
};
