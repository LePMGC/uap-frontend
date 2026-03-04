import api from "@/lib/api";

export const dataSourceService = {
  getAll: async (page = 1, limit = 10, filters: any = {}) => {
    const params = {
      page,
      per_page: limit,
      ...filters,
    };

    const response = await api.get("/data-sources", { params });
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await api.get(`/data-sources/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/data-sources", data);
    return response.data;
  },

  update: async (id: number | string, data: any) => {
    const response = await api.put(`/data-sources/${id}`, data);
    return response.data;
  },

  deleteDataSource: async (id: number | string) => {
    const response = await api.delete(`/data-sources/${id}`);
    return response.data;
  },

  testConnection: async (data: any) => {
    const response = await api.post("/data-sources/test", data);
    return response.data;
  },
};
