// src/services/provisioningProfilesService.ts
import api from "@/lib/api";

export interface ProvisioningProfileFilter {
  search?: string;
  reimbursement_type?: string;
  execution_mode?: string;
  is_active?: boolean;
}

export const provisioningProfilesService = {
  /**
   * Fetch paginated provisioning profiles
   */
  getProfiles: async (
    page: number = 1,
    perPage: number = 10,
    filters: ProvisioningProfileFilter = {},
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),

      ...(filters.search && {
        search: filters.search,
      }),

      ...(filters.reimbursement_type && {
        reimbursement_type: filters.reimbursement_type,
      }),

      ...(filters.execution_mode && {
        execution_mode: filters.execution_mode,
      }),

      ...(filters.is_active !== undefined && {
        is_active: String(filters.is_active),
      }),
    });

    const response = await api.get(
      `/operations/provisioning-profiles?${params.toString()}`,
    );

    return response.data;
  },

  /**
   * Fetch single profile
   */
  getProfileById: async (id: string | number) => {
    const response = await api.get(`/operations/provisioning-profiles/${id}`);

    return response.data;
  },

  /**
   * Create profile
   */
  createProfile: async (payload: any) => {
    const response = await api.post(
      "/operations/provisioning-profiles",
      payload,
    );

    return response.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (id: string | number, payload: any) => {
    const response = await api.put(
      `/operations/provisioning-profiles/${id}`,
      payload,
    );

    return response.data;
  },

  /**
   * Delete profile
   */
  deleteProfile: async (id: string | number) => {
    const response = await api.delete(
      `/operations/provisioning-profiles/${id}`,
    );

    return response.data;
  },
};
