// src/services/commandService.ts

import api from "@/lib/api";

export const commandService = {
  // Fetches the dynamic list of categories (slugs and names)
  getCategories: async () => {
    const response = await api.get("/provider-categories");
    return response.data;
  },

  // Fetches commands filtered by category_slug
  getCommands: async (page = 1, limit = 5, filters: any = {}) => {
    const params = {
      page,
      per_page: limit,
      ...filters,
    };

    const response = await api.get("/management/commands", { params });
    return response.data;
  },

  getCommandsByCategory: async (category_slug: string) => {
    const response = await api.get("/management/commands", {
      params: { category: category_slug, per_page: 1000 },
    });
    return response.data.data; // ✅
  },

  // Fetches one command
  getOneCommand: async (id: number | string) => {
    const response = await api.get(`/management/commands/${id}`);
    return response.data;
  },

  createCommand: async (data: any) => {
    const response = await api.post("/management/commands", data);
    return response.data;
  },

  updateCommand: async (id: number | string, data: any) => {
    const response = await api.put(`/management/commands/${id}`, data);
    return response.data;
  },

  deleteCommand: async (id: number | string) => {
    const response = await api.delete(`/management/commands/${id}`);
    return response.data;
  },

  getCommandTree: async (search?: string) => {
    // Pass the search string as a query parameter
    const response = await api.get("/management/commands/tree", {
      params: { search },
    });
    return response.data;
  },

  execute: async (data: any) => {
    const response = await api.post("/command-logs", data);
    return response.data;
  },

  /**
   * Fetches paginated command logs with optional filters
   * @param params { page, per_page, search, status, category_slug }
   */
  getCommandLogs: async (page = 1, limit = 5, filters: any = {}) => {
    const params = {
      page,
      per_page: limit,
      ...filters,
    };

    const response = await api.get("/command-logs", { params });
    return response.data;
  },

  // src/services/commandService.ts
  getLogById: async (id: string) => {
    const response = await api.get(`/command-logs/${id}`);
    // Unwrap the nested 'data' property from the BE response
    return response.data.data;
  },
};
