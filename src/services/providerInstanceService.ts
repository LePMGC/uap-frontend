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

  // Use this for NEW instances or when editing (unsaved settings)
  testConnection: async (payload: {
    category_slug: string;
    connection_settings: any;
  }) => {
    const response = await api.post(
      "/management/instances/test-connection",
      payload,
    );
    return response.data;
  },

  // Use this for ALREADY REGISTERED instances (using existing ID)
  ping: async (id: number | string) => {
    const response = await api.post(`/management/instances/${id}/ping`);
    return response.data;
  },
};
