import api from "@/lib/api";
import type { LeapParseResponse } from "@/types/leapLogs";

// /var/www/html/uap-frontend/src/services/leapLogService.ts
export const leapLogService = {
  parse: async (logs: string): Promise<LeapParseResponse> => {
    const response = await api.post("/leap-logs/parse", { raw_logs: logs });

    // Ensure that journeys[].logs is always an actual Array
    const sanitizedData = response.data.data.map((journey: any) => ({
      ...journey,
      logs: Object.values(journey.logs || {}), // Converts {"0": {...}} to [{...}]
    }));

    return {
      ...response.data,
      data: sanitizedData,
    };
  },
};
