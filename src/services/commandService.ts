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

  getCommandTree: async () => {
    const response = await api.get("/management/commands/tree");
    return response.data;
  },
};
