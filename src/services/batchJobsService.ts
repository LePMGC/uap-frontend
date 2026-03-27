import api from "@/lib/api";

export const batchJobsService = {
  getJobs: async (page = 1, limit = 10, filters: any = {}) => {
    const params = {
      page,
      per_page: limit,
      ...filters,
    };

    const response = await api.get("/batch/templates", { params });
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await api.get(`/batch/templates/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/batch/templates", data);
    return response.data;
  },

  update: async (id: number | string, data: any) => {
    const response = await api.put(`/batch/templates${id}`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/batch/templates/stats");
    return response.data;
  },
};
