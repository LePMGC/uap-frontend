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
  created_at_start?: string; // ISO Date filter boundaries
  created_at_end?: string;
  reimbursement_mode: "AUTO" | "MANUAL";
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
  approved_by_user_id?: string | number;
  created_at: string;
  updated_at: string;
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

// --- NEW INTERFACES FOR FILE ANALYSIS ENGINE ---

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
}

export interface UploadedAttachmentResult {
  id: string | number;
  file_name: string;
  file_url: string;
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
   * Fetch aggregate micro-visibility counter metrics for the top dashboard cards
   */
  getStats: async (): Promise<{
    success: boolean;
    data: ReimbursementStats;
  }> => {
    try {
      const response = await api.get("/operations/reimbursements/stats");
      return response.data;
    } catch (error) {
      console.error("reimbursementsService.getStats failed:", error);
      throw error;
    }
  },

  /**
   * Fetch detailed metadata context for a specific reimbursement entry
   */
  getReimbursementById: async (
    id: number | string,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.get(`/operations/reimbursements/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `reimbursementsService.getReimbursementById failed for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Initialize and submit a single or batch reimbursement request into the approval stream
   */
  createReimbursement: async (
    payload: ReimbursementCreationPayload,
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.post("/operations/reimbursements", payload);
      return response.data;
    } catch (error) {
      console.error("reimbursementsService.createReimbursement failed:", error);
      throw error;
    }
  },

  /**
   * Authorize a pending request (Checker action).
   * Note: Triggers automated programmatic payload dispatch directly to LEAP if reimbursement_mode is 'AUTO'.
   */
  approve: async (id: number | string): Promise<ReimbursementItem> => {
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
  reject: async (
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
   * Explicitly append operational evidence attachments or receipts during manual resolution steps.
   */
  addAttachment: async (
    id: number | string,
    attachmentIds: (string | number)[],
  ): Promise<ReimbursementItem> => {
    try {
      const response = await api.post(
        `/operations/reimbursements/${id}/attachments`,
        {
          attachment_ids: attachmentIds,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        `reimbursementsService.addAttachment failed for ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Transmit raw spreadsheet matrix byte-stream chunks directly to the back-end parsing engine.
   * This executes structural formatting matches and database product eligibility calculations.
   */
  validateSourceSheet: async (file: File): Promise<FileValidationResult> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

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
      console.error("reimbursementsService.validateSourceSheet failed:", error);
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
};
