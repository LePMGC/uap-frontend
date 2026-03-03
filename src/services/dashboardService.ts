import api from "@/lib/api";

// ...existing code...
const MOCK_STATS = {
  users: 120,
  activeUsers: 42,
  revenue: 12345,
  // add fields your UI expects
};

// ...existing code...
export const DashboardService = {
  // Add more methods as needed for other dashboard data
  getPlatformHealth: async () => {
    try {
      const response = await api.get(`/dashboard/platform-health`);

      // Based on your BE sample: { "services": [...] }
      // We return the array inside "services"
      return response.data?.services ?? [];
    } catch (error) {
      console.error("DashboardService.getPlatformHealth failed:", error);
      return []; // Return empty array to prevent .map() crashes
    }
  },

  getPrividersHealth: async () => {
    try {
      const response = await api.get(`/dashboard/providers-health`);
      return response.data?.providers ?? [];
    } catch (error) {
      console.error("DashboardService.getProvidersHealth failed:", error);
      return [];
    }
  },

  getStats: async () => {
    try {
      const response = await api.get(`/dashboard/stats`);
      return response.data?.stats ?? {};
    } catch (error) {
      console.error("DashboardService.getStats failed:", error);
      return {};
    }
  },

  getRecentActivities: async () => {
    try {
      const response = await api.get(`/dashboard/recent-activities`);
      return response.data?.activities ?? [];
    } catch (error) {
      console.error("DashboardService.getRecentActivities failed:", error);
      return [];
    }
  },
};
