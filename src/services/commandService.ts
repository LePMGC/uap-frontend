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
};
