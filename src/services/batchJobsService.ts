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

  update: async (id: number | string, data: any) => {
    const response = await api.put(`/batch/templates${id}`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/batch/templates/stats");
    return response.data;
  },

  discoverSchema: async (payload: FormData | object) => {
    const isFormData = payload instanceof FormData;

    const response = await api.post(
      "/batch/discover-headers-and-first-rows",
      payload,
      {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      },
    );
    return response.data;
  },

  create: async (data: any) => {
    // This calls POST /batch/templates as per your requirement
    const response = await api.post("/batch/templates", data);
    return response.data;
  },

  /**
   * Fetch all execution instances for a specific job template.
   * Powers the "Select Instance" dropdown.
   */
  getInstances: async (templateId: string | number) => {
    const response = await api.get(`/batch/templates/${templateId}/instances`);
    return response.data; // Expected: Array of { id, name, executed_at, status }
  },

  /**
   * Fetch summary statistics and error analysis for a specific instance.
   * Powers the Metric Cards and Error Analysis sidebar.
   */
  getInstanceDetails: async (instanceId: string | number) => {
    const response = await api.get(`/batch/instances/${instanceId}/summary`);
    return response.data;
  },

  /**
   * Fetch paginated logs for a specific execution instance.
   * Powers the Command Logs table and status filters.
   */
  getInstanceLogs: async (
    instanceId: string | number,
    page = 1,
    limit = 10,
    status?: string,
  ) => {
    const params = {
      page,
      per_page: limit,
      ...(status && status !== "All" && { status: status.toLowerCase() }),
    };

    const response = await api.get(`/batch/instances/${instanceId}/logs`, {
      params,
    });
    return response.data;
  },

  /**
   * Action to retry all failed records for a specific instance.
   * Powers the "Retry Failed" button.
   */
  retryFailedRecords: async (instanceId: string | number) => {
    const response = await api.post(
      `/batch/instances/${instanceId}/retry-failed`,
    );
    return response.data;
  },

  /**
   * Action to retry a single specific record.
   * Powers the individual row-level retry icon.
   */
  retrySingleRecord: async (instanceId: string | number, recordId: string) => {
    const response = await api.post(
      `/batch/instances/${instanceId}/records/${recordId}/retry`,
    );
    return response.data;
  },

  retryByErrorCode: async (instanceId: string | number, errorCode: string) => {
    const response = await api.post(
      `/batch/instances/${instanceId}/retry-by-error`,
      { error_code: errorCode },
    );
    return response.data;
  },

  downloadReport: async (instanceId: string | number) => {
    const response = await api.get(
      `/batch/instances/${instanceId}/download-report`,
      { responseType: "blob" },
    );
    return response.data; // This will be a Blob for file download
  },

  exportErrorsByCode: async (
    instanceId: string | number,
    errorCode: string,
  ) => {
    const response = await api.get(
      `/batch/instances/${instanceId}/export-errors`,
      {
        params: { error_code: errorCode },
        responseType: "blob",
      },
    );

    // Trigger the browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `errors_${errorCode}_instance_${instanceId}.csv`,
    );
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  exportAllErrors: async (instanceId: string | number) => {
    const response = await api.get(
      `/batch/instances/${instanceId}/export-all-errors`,
      { responseType: "blob" },
    );

    // Trigger the browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `all_errors_instance_${instanceId}.csv`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  downloadSourceFile: async (instanceId: string | number) => {
    const response = await api.get(
      `/batch/instances/${instanceId}/download-source`,
      { responseType: "blob" },
    );

    // Trigger the browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `source_instance_${instanceId}.csv`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  downloadSampleInputFile: async () => {
    try {
      const response = await api.get(
        `/batch/templates/download-sample-source-file`,
        {
          responseType: "blob", // Critical for receiving file data
        },
      );

      // Create a local URL for the binary data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Define the filename
      const filename = `sample_template_${"generic"}.csv`;
      link.setAttribute("download", filename);

      // Append, trigger, and cleanup
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Download failed:", error);
      throw error;
    }
  },
};
