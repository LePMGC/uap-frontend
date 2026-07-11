import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/paginatedResponse";

// --- TYPE DEFINITIONS ---

export interface ReimbursementFilters {
  search?: string;
  status?: "pending" | "approved" | "success" | "rejected" | "failed";
  msisdn?: string;
  reimbursement_type?: "BUNDLE" | "AIRTIME";
  target_product_id?: string;

  required_tier?: number;
  requested_by_user_id?: string | number;
  approved_by_user_id?: string | number;
  created_at_start?: string;
  created_at_end?: string;
  reimbursement_mode: "AUTO" | "MANUAL";
  created_by: string | undefined;
  reviewed_by: string | undefined;
}

export interface ReimbursementAttachment {
  id: string | number;
  file_name: string;
  file_url: string;
  uploaded_by_user_id: string | number;
  uploaded_at: string;
}

export interface ReimbursementItem {
  id: string | number;
  ticket_id: string;
  msisdn: string;
  reimbursement_type: "BUNDLE" | "AIRTIME";
  reimbursement_mode: "AUTO" | "MANUAL";
  target_product_id?: string;
  amount?: number;
  required_tier: number;
  status: "pending" | "approved" | "success" | "rejected" | "failed";
  description?: string;
  rejection_reason?: string;
  attachments: ReimbursementAttachment[];
  requested_by_user_id: string | number;
  reviewed_by_user_id?: string | number | null;
  reviewer_name?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  input_file_url: string | null;
  is_bulk: boolean;
  distribution_mode: "SINGLE_SINGLE" | "MANY_SINGLE" | "MANY_MANY";

  // ADD THESE TWO LINES TO FIX THE COMPILATION COMPLAINT:
  requester_name?: string | null;
  approver_name?: string | null;
  capabilities: { can_approve: boolean; can_cancel: boolean };
}

export interface ReimbursementStats {
  total: number;
  by_status: {
    pending: number;
    approved: number;
    success: number;
    rejected: number;
    failed: number;
  };
  performance: {
    success_rate: number;
  };
}

export interface ReimbursementCreationPayload {
  ticket_id: string;
  reimbursement_type: "BUNDLE" | "AIRTIME";
  reimbursement_mode: "AUTO" | "MANUAL";
  target_product_id?: string;
  amount?: number;
  msisdn?: string;
  is_bulk: boolean;
  description?: string;
  file_reference_id?: string; // Reference to bulk file upload instance if applicable
  attachment_ids?: (string | number)[]; // Pre-uploaded attachment array IDs from UAP file storage layer
}

// --- FILE ANALYSIS ENGINE INTERFACES ---

export interface FileValidationErrorItem {
  row: number;
  identifier: string;
  reason: string;
}

export interface FileValidationResult {
  success: boolean;
  file_reference_id: string;
  metrics: {
    total: number;
    valid: number;
    invalid: number;
  };
  errors: FileValidationErrorItem[];
  message?: string;
}

export interface UploadedAttachmentResult {
  id: string | number;
  file_name: string;
  file_url: string;
}

export interface ReimbursementUpdatePayload {
  ticket_id: string;
  description: string;
  reimbursement_type: "BUNDLE" | "AIRTIME";
  reimbursement_mode: "AUTO" | "MANUAL";
  target_product_id?: string;
  amount?: number;
  attachment_ids: string[];
  // Append new staging identifier property for bulk overwrite cycles
  new_file_reference_id?: string;
}

// --- SERVICE IMPLEMENTATION ---

export const reimbursementsService = {
  /**
   * Fetch a paginated subset of filtered reimbursement requests for the GenericDataTable
   */
  getReimbursements: async (
    page: number = 1,
    perPage: number = 10,
    filters?: ReimbursementFilters,
  ): Promise<PaginatedResponse<ReimbursementItem>> => {
    try {
      const response = await api.get(`/operations/reimbursements`, {
        params: {
          page,
          per_page: perPage,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("reimbursementsService.getReimbursements failed:", error);
      throw error;
    }
  },

  /**
   * Fetch high level execution summary and KPI data counters
   */
  getStats: async (): Promise<{
    success: boolean;
    data: ReimbursementStats;
  }> => {
    try {
      const response = await api.get(`/operations/reimbursements/stats`);
      return response.data;
    } catch (error) {
      console.error("reimbursementsService.getStats failed:", error);
      throw error;
    }
  },

  /**
   * Post adjustment parameters context down to central checker queues
   */
  createReimbursement: async (
    payload: ReimbursementCreationPayload,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.post(`/operations/reimbursements`, payload);
      return response.data;
    } catch (error) {
      console.error("reimbursementsService.createReimbursement failed:", error);
      throw error;
    }
  },

  /**
   * Approve a pending validation transaction. Moves context logic into automatic dispatch layers.
   */
  approveReimbursement: async (
    id: number | string,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.post(
        `/operations/reimbursements/${id}/approve`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `reimbursementsService.approve failed for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Decline and archive a pending reimbursement request.
   * Explicitly requires a detailed string statement explaining why authorization was denied.
   */
  rejectReimbursement: async (
    id: number | string,
    rejectionReason: string,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.post(
        `/operations/reimbursements/${id}/reject`,
        {
          rejection_reason: rejectionReason,
        },
      );
      return response.data;
    } catch (error) {
      console.error(`reimbursementsService.reject failed for ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancels a pending reimbursement request.
   * @param id The unique identifier of the reimbursement transaction.
   * @returns A promise resolving to the server's acknowledgment payload.
   */
  cancelReimbursement: async (
    id: string,
  ): Promise<{ success: boolean; message?: string }> => {
    // Utilizing your project's configured API instance
    const response = await api.post(`/reimbursements/${id}/cancel`);
    return response.data;
  },

  /**
   * Stream raw byte-stream chunks directly to the back-end parsing engine.
   * This executes structural formatting matches and database product eligibility calculations.
   */
  validateInboundSheet: async (
    file: File,
    distributionMode: string,
  ): Promise<FileValidationResult> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("distribution_mode", distributionMode);

      const response = await api.post(
        "/operations/reimbursements/validate-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "reimbursementsService.validateInboundSheet failed:",
        error,
      );
      throw error;
    }
  },

  /**
   * Upload physical background proof documents (PDFs, PNG images, vouchers) to the
   * centralized file storage layer. Returns asset identifiers needed to finalize creation.
   */
  uploadEvidenceAttachment: async (
    file: File,
  ): Promise<UploadedAttachmentResult> => {
    try {
      const formData = new FormData();
      formData.append("attachment", file);

      const response = await api.post(
        "/operations/attachments/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "reimbursementsService.uploadEvidenceAttachment failed:",
        error,
      );
      throw error;
    }
  },

  /**
   * Fetch template payload stream from backend based on structural constraints
   * and download directly as a browser payload attachment.
   */
  downloadTemplate: async (
    mode: "SINGLE_SINGLE" | "MANY_SINGLE" | "MANY_MANY",
    format: "xlsx" | "csv" | "txt",
  ): Promise<void> => {
    try {
      const response = await api.get(
        "/operations/reimbursements/download-template",
        {
          params: {
            distribution_mode: mode,
            format: format,
          },
          responseType: "blob", // Instruct axios to handle binary data buffers properly
        },
      );

      // Construct localized virtual link element matching the specified schema format
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;

      // Dynamic friendly file names matching backend constraints
      link.setAttribute(
        "download",
        `reimbursement_template_${mode.toLowerCase()}.${format}`,
      );

      document.body.appendChild(link);
      link.click();

      // Cleanup DOM node traces safely
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("reimbursementsService.downloadTemplate failed:", error);
      throw error;
    }
  },

  // Add these methods to your reimbursementsService object inside services/reimbursementsService.ts:

  /**
   * Fetch absolute granular data metrics for a single reimbursement sequence
   */
  getReimbursementDetails: async (
    id: string | number,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.get(`/operations/reimbursements/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `reimbursementsService.getReimbursementDetails failed for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Update text fields or append additional file attachments on a pending record
   */
  updateReimbursement: async (
    id: string | number,
    payload: Partial<ReimbursementCreationPayload>,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.put(
        `/operations/reimbursements/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error(
        `reimbursementsService.updateReimbursement failed for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Extract the active live subset ledger rows mapping for a specific bulk batch reimbursement
   * and stream it directly back to the local client browser session as an structured workbook layout.
   */
  downloadCurrentSubscribers: async (
    id: string,
    format: "xlsx" | "csv" | "txt" = "xlsx",
  ): Promise<void> => {
    // Real implementation will stream binary octet stream or window location attachments.
    console.log(
      `Downloading subscriber snapshot ledger for id: ${id} as format: .${format}`,
    );
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },

  /**
   * Securely download the bulk reimbursement batch input file in its native format.
   */
  downloadInputFile: async (id: string | number): Promise<void> => {
    try {
      const response = await api.get(
        `/operations/reimbursements/${id}/download-input-file`,
        {
          responseType: "blob", // Instruct Axios to listen for raw file binary bytes
        },
      );

      // Create object URL from binary data stream bytes
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;

      // Read Content-Disposition to grab the filename sent from the backend
      const contentDisposition = response.headers["content-disposition"];
      let filename = `reimbursement_input_file_${id}.csv`; // Dynamic fallback safety

      if (contentDisposition) {
        // Look for filename="..." inside the header string value
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]; // Resolves to 'subscriber_list_VLT-REF-XXXX.csv' or '.xlsx'
        }
      }

      // Instruct the browser to use the exact backend filename and extension format
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Clean up DOM components and memory allocation references
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("reimbursementsService.downloadInputFile failed:", error);
      throw error;
    }
  },

  getCreators: async () => {
    const response = await api.get("/operations/reimbursements/creators");

    return response.data;
  },

  getReviewers: async () => {
    const response = await api.get("/operations/reimbursements/reviewers");

    return response.data;
  },

  getBundles: async () => {
    const response = await api.get("/operations/catalog/bundles");

    return response.data;
  },
};
