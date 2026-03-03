// src/services/InstanceService.ts
import api from "@/lib/api"; // Import the custom instance
import { Command } from "lucide-react";

export interface ProviderInstance {
  id: number;
  name: string;
  category_slug: string;
  is_active: boolean;
}

export interface Command {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export const InstanceService = {
  getInstances: async (): Promise<ProviderInstance[]> => {
    try {
      // Base URL and Token are already handled by the 'api' instance
      const response = await api.get("/management/instances");
      return response.data?.data ?? [];
    } catch (error) {
      console.error("InstanceService.getInstances failed:", error);
      return [];
    }
  },

  getCommands: async (
    instanceId: string | number,
    grouped: boolean = false,
  ): Promise<any> => {
    try {
      const response = await api.get(
        `/management/instances/${instanceId}/commands`,
        { params: { grouped } },
      );

      // If we asked for flat data, BE returns it under a 'data' key
      if (!grouped) {
        return response.data?.data ?? [];
      }

      // If we asked for grouped, BE returns the Record<string, Command[]>
      return response.data;
    } catch (error) {
      console.error("InstanceService.getCommands failed:", error);
      return grouped ? {} : [];
    }
  },
};
