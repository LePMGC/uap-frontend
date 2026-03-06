// src/services/providerInstanceService.ts
import api from "@/lib/api";

export const providerInstanceService = {
  getAll: async (page = 1, limit = 10, filters: any = {}) => {
    const params = {
      page,
      per_page: limit,
      ...filters,
    };
    const response = await api.get("/management/instances", { params });
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await api.get(`/management/instances/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/management/instances", data);
    return response.data;
  },

  update: async (id: number | string, data: any) => {
    const response = await api.put(`/management/instances/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await api.delete(`/management/instances/${id}`);
    return response.data;
  },

  testConnection: async (data: any) => {
    const response = await api.post(
      "/management/instances/test-connection",
      data,
    );
    return response.data;
  },
};
