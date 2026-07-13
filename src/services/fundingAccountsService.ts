// src/services/fundingAccountsService.ts

import api from "@/lib/api";

export interface FundingAccount {
  id: string;
  name: string;
  msisdn: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FundingAccountFilter {
  search?: string;
  msisdn?: string;
  is_active?: boolean;
}

export const fundingAccountsService = {
  /**
   * Fetch paginated funding accounts
   */
  getAccounts: async (
    page: number = 1,
    perPage: number = 10,
    filters: FundingAccountFilter = {},
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (filters.search) {
      params.append("search", filters.search);
    }

    if (filters.msisdn) {
      params.append("msisdn", filters.msisdn);
    }

    if (filters.is_active !== undefined) {
      params.append("is_active", String(filters.is_active));
    }

    const response = await api.get(
      `/operations/funding-accounts?${params.toString()}`,
    );

    return response.data;
  },

  /**
   * Fetch a single funding account
   */
  getAccountById: async (id: string) => {
    const response = await api.get(`/operations/funding-accounts/${id}`);
    return response.data;
  },

  /**
   * Create a funding account
   */
  createAccount: async (payload: {
    name: string;
    msisdn: string;
    description?: string | null;
    is_active?: boolean;
  }) => {
    const response = await api.post("/operations/funding-accounts", payload);

    return response.data;
  },

  /**
   * Update a funding account
   */
  updateAccount: async (
    id: string,
    payload: Partial<{
      name: string;
      msisdn: string;
      description: string | null;
      is_active: boolean;
    }>,
  ) => {
    const response = await api.put(
      `/operations/funding-accounts/${id}`,
      payload,
    );

    return response.data;
  },

  /**
   * Delete a funding account
   */
  deleteAccount: async (id: string) => {
    const response = await api.delete(`/operations/funding-accounts/${id}`);

    return response.data;
  },

  async updateStatus(id: string, payload: { is_active: boolean }) {
    return api.patch(`/operations/funding-accounts/${id}/status`, payload);
  },
};
