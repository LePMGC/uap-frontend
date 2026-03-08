// src/services/auditLogService.ts
import api from "@/lib/api";

export const auditLogService = {
  // General Audit Feed (Paginated)
  getLogs: async (page = 1, limit = 15, filters: any = {}) => {
    const params = { page, per_page: limit, ...filters };
    const response = await api.get("/audit-logs", { params });
    return response.data;
  },

  // Security Specific Logs
  getSecurityLogs: async (page = 1, limit = 15, filters: any = {}) => {
    const params = { page, per_page: limit, ...filters };
    const response = await api.get("/audit-logs/security", { params });
    return response.data;
  },

  // Trace Timeline (Sequence of events for a specific action)
  getTraceTimeline: async (traceId: string) => {
    const response = await api.get(`/audit-logs/trace/${traceId}`);
    return response.data;
  },

  // Connectivity Statistics
  getConnectivityStats: async (page = 1, limit = 15, filters: any = {}) => {
    const params = { page, per_page: limit, ...filters };
    const response = await api.get("/audit-logs/stats/connectivity", {
      params,
    });
    return response.data;
  },

  // Export to CSV
  exportLogs: async (filters: any = {}) => {
    const response = await api.get("/audit-logs/export", {
      params: filters,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `audit_logs_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
  },
};
