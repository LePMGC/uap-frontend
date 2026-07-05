import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Package,
  Coins,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Paperclip,
  Trash2,
  Edit3,
  Save,
  X,
  User,
  ExternalLink,
  ChevronDown,
  Search,
  Download,
  UploadCloud,
  FileDown,
  Layers,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Ban,
} from "lucide-react";
import {
  reimbursementsService,
  type ReimbursementItem,
} from "@/services/reimbursementsService";
import { useToastStore } from "@/hooks/useToastStore";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";
import { cn } from "@/lib/utils";

type TemplateFormat = "xlsx" | "csv" | "txt";

interface ValidationErrorLog {
  row: number;
  identifier: string;
  reason: string;
}

interface IngestionMetrics {
  total: number;
  valid: number;
  invalid: number;
}

const MOCK_BUNDLE_CATEGORIES = [
  "Data",
  "Voice",
  "SMS",
  "Combo",
  "International",
];
const MOCK_BUNDLES_DB = [
  {
    id: "DATA_DAILY_1GB",
    name: "Daily Heavy Data 1GB",
    category: "Data",
    price: "CFA 10.00",
  },
  {
    id: "DATA_WEEKLY_5GB",
    name: "Weekly Super Data 5GB",
    category: "Data",
    price: "CFA 50.00",
  },
  {
    id: "DATA_MONTHLY_20GB",
    name: "Monthly Elite Data 20GB",
    category: "Data",
    price: "CFA 150.00",
  },
  {
    id: "VOICE_DAILY_MINS",
    name: "Daily Talk 50 Mins",
    category: "Voice",
    price: "CFA 5.00",
  },
  {
    id: "VOICE_MONTHLY_600M",
    name: "Monthly Corporate 600 Mins",
    category: "Voice",
    price: "CFA 80.00",
  },
  {
    id: "SMS_WEEKLY_MAX",
    name: "Weekly SMS Blast 500 SMS",
    category: "SMS",
    price: "CFA 12.00",
  },
  {
    id: "COMBO_WEEKLY_MED",
    name: "Weekly Hybrid Med Bundle",
    category: "Combo",
    price: "CFA 25.00",
  },
  {
    id: "INT_ZONE_A_ROAM",
    name: "International Roaming Zone A",
    category: "International",
    price: "CFA 200.00",
  },
];

export default function ReimbursementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  // Auth & Permissions
  const currentUser = useAuthStore((state) => state.user);
  const userPermissions = useMemo(
    () => currentUser?.permissions || [],
    [currentUser],
  );

  const canModify =
    userPermissions.includes(PERM.CREATE_SINGLE_REIMBURSEMENTS) ||
    userPermissions.includes(PERM.CREATE_BULK_REIMBURSEMENTS);

  const canApproveReject =
    userPermissions.includes(PERM.APPROVE_TIER3_REIMBURSEMENTS) ||
    userPermissions.includes(PERM.APPROVE_TIER2_REIMBURSEMENTS) ||
    userPermissions.includes(PERM.APPROVE_TIER1_REIMBURSEMENTS);
  const canCancel =
    userPermissions.includes(PERM.CANCEL_REIMBURSEMENTS) || canModify;

  // States Workspace
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isActioning, setIsActioning] = useState<boolean>(false);
  const [record, setRecord] = useState<ReimbursementItem | null>(null);

  // Overlay Dialog States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Form Parameters
  const [ticketId, setTicketId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [reimbursementType, setReimbursementType] = useState<
    "BUNDLE" | "AIRTIME"
  >("BUNDLE");
  const [reimbursementMode, setReimbursementMode] = useState<"AUTO" | "MANUAL">(
    "AUTO",
  );
  const [isBulk, setIsBulk] = useState<boolean>(false);
  const [msisdn, setMsisdn] = useState<string>("");
  const [targetProductId, setTargetProductId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [attachments, setAttachments] = useState<
    { id: string; name: string }[]
  >([]);

  // Bulk Staging Overwrites
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [currentFileReferenceId, setCurrentFileReferenceId] = useState<
    string | null
  >(null);
  const [newFileReferenceId, setNewFileReferenceId] = useState<string | null>(
    null,
  );

  const [bulkMetrics, setBulkMetrics] = useState<IngestionMetrics>({
    total: 0,
    valid: 0,
    invalid: 0,
  });
  const [bulkErrors, setBulkErrors] = useState<ValidationErrorLog[]>([]);

  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] =
    useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloadingInput, setIsDownloadingInput] = useState<boolean>(false);

  // Dropdown Category Selectors
  const [selectedCategory, setSelectedCategory] = useState<string>("Data");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
      }
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBundles = useMemo(() => {
    return MOCK_BUNDLES_DB.filter(
      (b) =>
        b.category === selectedCategory &&
        (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [selectedCategory, searchQuery]);

  const selectedBundleName = useMemo(() => {
    const bundle = MOCK_BUNDLES_DB.find((b) => b.id === targetProductId);
    return bundle
      ? `${bundle.name} (${bundle.price})`
      : "Choose explicit product schema...";
  }, [targetProductId]);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await reimbursementsService.getReimbursementDetails(id);
      const data = (response as any).data || response;

      if (!data)
        throw new Error(
          "Missing structural item block wrapper data exceptions.",
        );

      setRecord(data);
      setTicketId(data.ticket_id);
      setDescription(data.description || "");
      setReimbursementType(data.reimbursement_type);
      setReimbursementMode(data.reimbursement_mode);
      setIsBulk(!!data.is_bulk);
      setMsisdn((data as any).msisdn || "");
      setTargetProductId(data.target_product_id || "");
      setAmount(
        data.amount !== null && data.amount !== undefined
          ? String(data.amount)
          : "",
      );

      setCurrentFileReferenceId(data.file_reference_id || null);
      setUploadedFile(null);
      setNewFileReferenceId(null);
      setBulkErrors([]);

      if (data.target_product_id) {
        const matchingBundle = MOCK_BUNDLES_DB.find(
          (b) => b.id === data.target_product_id,
        );
        if (matchingBundle) setSelectedCategory(matchingBundle.category);
      }

      if (data.attachments) {
        setAttachments(
          data.attachments.map((att: any) => ({
            id: String(att.id),
            name: att.file_name,
          })),
        );
      }
      if (data.bulk_metrics) {
        setBulkMetrics(data.bulk_metrics);
      } else {
        setBulkMetrics({ total: 0, valid: 0, invalid: 0 });
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to retrieve structural details.", "error");
      navigate("/reimbursements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // --- WORKFLOW TRANSACTIONS INTERFACES ---
  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsActioning(true);
      await reimbursementsService.approveReimbursement(id);
      showToast("Reimbursement transaction approved successfully.", "success");
      setIsApproveModalOpen(false);
      await fetchDetails();
    } catch (error) {
      showToast(
        "An error occurred during approval configuration layout updates.",
        "error",
      );
    } finally {
      setIsActioning(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rejectionReason.trim()) return;

    try {
      setIsActioning(true);
      await reimbursementsService.rejectReimbursement(
        id,
        rejectionReason.trim(),
      );
      showToast("Reimbursement marked as rejected.", "success");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      await fetchDetails();
    } catch (error) {
      showToast("Failed to update rejection metrics logs.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsActioning(true);
      await reimbursementsService.cancelReimbursement(id);
      showToast("Reimbursement request has been cancelled.", "success");
      setIsCancelModalOpen(false);
      await fetchDetails();
    } catch (error) {
      showToast("Failed to cancel pending request ledger entry.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSecureInputDownload = async () => {
    if (!id) return;
    try {
      setIsDownloadingInput(true);
      await reimbursementsService.downloadInputFile(id);
      showToast("Input spreadsheet downloaded successfully.", "success");
    } catch (error) {
      showToast(
        "Session file fetch unauthorized or missing on storage layers.",
        "error",
      );
    } finally {
      setIsDownloadingInput(false);
    }
  };

  const handleCurrentSubscriberDownload = async (format: TemplateFormat) => {
    if (!id) return;
    try {
      setIsDownloading(true);
      await reimbursementsService.downloadCurrentSubscribers(id, format);
      showToast(
        "Current subscriber template exported successfully.",
        "success",
      );
    } catch (error) {
      showToast(
        "Failed to generate download template format data stream.",
        "error",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileIngestion = async (file: File) => {
    if (!record) return;
    setIsProcessingFile(true);
    setBulkErrors([]);

    try {
      const distributionMode = targetProductId ? "MANY_SINGLE" : "MANY_MANY";
      const response = await reimbursementsService.validateInboundSheet(
        file,
        distributionMode,
      );

      if (response.success) {
        setUploadedFile(file);
        setNewFileReferenceId(response.file_reference_id);
        setBulkMetrics(response.metrics);
        setBulkErrors(response.errors || []);

        if (response.metrics.invalid > 0) {
          showToast(
            `Replacement data contains ${response.metrics.invalid} schema violations.`,
            "error",
          );
        } else {
          showToast("Replacement list staged cleanly.", "success");
        }
      } else {
        throw new Error(
          response.message || "File validation formatting breakdown.",
        );
      }
    } catch (err: any) {
      setUploadedFile(null);
      setNewFileReferenceId(null);
      showToast(
        err?.message || "Failed to process target matrix replacement.",
        "error",
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newItems: { id: string; name: string }[] = [];
      for (const file of Array.from(files)) {
        const response =
          await reimbursementsService.uploadEvidenceAttachment(file);
        const serverPayload = (response as any).data || response;
        if (serverPayload && serverPayload.id) {
          newItems.push({
            id: String(serverPayload.id),
            name: serverPayload.file_name,
          });
        }
      }
      setAttachments((prev) => [...prev, ...newItems]);
      showToast("Support vouchers uploaded successfully.", "success");
    } catch (err) {
      showToast("Failed to upload evidence records.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (targetId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== targetId));
  };

  const handleSaveChanges = async () => {
    if (!id || !record) return;
    if (!ticketId.trim())
      return showToast("Trouble Ticket reference cannot be empty.", "error");
    if (!isBulk && !msisdn.trim())
      return showToast(
        "MSISDN parameter is required for single transactions.",
        "error",
      );
    if (isBulk && bulkErrors.length > 0)
      return showToast(
        "Clear validation errors before tracking update rules.",
        "error",
      );
    if (isBulk && !newFileReferenceId && !currentFileReferenceId) {
      return showToast(
        "A subscriber distribution file is required for bulk mode.",
        "error",
      );
    }

    const payload = {
      ticket_id: ticketId,
      description: description,
      reimbursement_type: reimbursementType,
      reimbursement_mode: reimbursementMode,
      is_bulk: isBulk,
      msisdn: !isBulk ? msisdn.trim() : undefined,
      target_product_id:
        reimbursementType === "BUNDLE" ? targetProductId : undefined,
      amount: reimbursementType === "AIRTIME" ? Number(amount) : undefined,
      attachment_ids: attachments.map((a) => a.id),
      file_reference_id: isBulk
        ? newFileReferenceId || currentFileReferenceId || undefined
        : undefined,
    };

    try {
      setIsSaving(true);
      await reimbursementsService.updateReimbursement(id, payload);
      showToast("Reimbursement transaction updated successfully.", "success");
      setIsEditing(false);
      await fetchDetails();
    } catch (err) {
      showToast("Failed to commit ledger synchronization updates.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { bg: string; text: string; icon: any; label: string }
    > = {
      pending: {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
        icon: Clock,
        label: "Pending Approval",
      },
      approved: {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-700",
        icon: CheckCircle2,
        label: "Approved",
      },
      success: {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
        icon: CheckCircle2,
        label: "Success",
      },
      rejected: {
        bg: "bg-rose-50 border-rose-200",
        text: "text-rose-700",
        icon: XCircle,
        label: "Rejected",
      },
      failed: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-700",
        icon: AlertCircle,
        label: "Execution Failed",
      },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <div
        className={cn(
          "px-3 py-1.5 border rounded-full flex items-center gap-1.5 text-xs font-bold w-fit shadow-sm",
          c.bg,
          c.text,
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {c.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400 text-xs font-semibold gap-2 font-mono animate-pulse">
        <Clock className="h-6 w-6 text-indigo-500 animate-spin" />
        LOADING WORKSPACE ENTRY REGISTRIES...
      </div>
    );
  }

  if (!record) return null;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 relative">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/reimbursements")}
            className="h-9 w-9 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Reimbursement Request Sequence Workspace
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              ID:{" "}
              <span className="font-mono text-indigo-600 text-base font-semibold bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">
                {record.id}
              </span>
            </h1>
          </div>
        </div>

        {/* Workflow State Validation Matrix Actions Menu Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {record.status === "pending" && (
            <>
              {canApproveReject && (
                <div className="flex items-center gap-2 border-r pr-2 mr-1 border-slate-200">
                  <button
                    type="button"
                    disabled={isActioning}
                    onClick={() => setIsRejectModalOpen(true)}
                    className="h-9 px-3.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 font-bold text-xs hover:bg-rose-100/60 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    type="button"
                    disabled={isActioning}
                    onClick={() => setIsApproveModalOpen(true)}
                    className="h-9 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Approve Context
                  </button>
                </div>
              )}

              {canCancel && (
                <button
                  type="button"
                  disabled={isActioning}
                  onClick={() => setIsCancelModalOpen(true)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Ban className="h-3.5 w-3.5 text-slate-400" /> Cancel Request
                </button>
              )}
            </>
          )}

          {record.status === "pending" && canModify && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchDetails();
                    }}
                    disabled={isSaving}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" /> Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={
                      isSaving || isUploading || (isBulk && isProcessingFile)
                    }
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />{" "}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-9 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Request Form
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">
              Primary Parameter Details
            </h2>

            {/* Injected Active Rejection Note Container */}
            {record.status === "rejected" && record.rejection_reason && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-[10px] text-rose-500 uppercase tracking-wide block">
                  Rejection Audit Parameter Description Note
                </span>
                <p className="font-mono bg-white p-2.5 border border-rose-200/60 rounded-lg font-medium leading-relaxed shadow-inner text-slate-700">
                  {record.rejection_reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Ticket className="h-3 w-3 text-indigo-500" /> Trouble Ticket
                  ID Reference
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    className="mt-1 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono outline-none focus:border-indigo-500 transition-colors"
                  />
                ) : (
                  <span className="font-mono text-slate-900 font-bold text-sm mt-0.5">
                    {ticketId}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Package className="h-3 w-3 text-indigo-500" /> Reimbursement
                  Mode Type
                </span>
                {isEditing ? (
                  <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setReimbursementMode("AUTO")}
                      className={cn(
                        "py-1 text-[11px] font-bold rounded-md transition-all",
                        reimbursementMode === "AUTO"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      AUTO
                    </button>
                    <button
                      type="button"
                      onClick={() => setReimbursementMode("MANUAL")}
                      className={cn(
                        "py-1 text-[11px] font-bold rounded-md transition-all",
                        reimbursementMode === "MANUAL"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      MANUAL
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        record.reimbursement_mode === "AUTO"
                          ? "bg-purple-500"
                          : "bg-blue-500",
                      )}
                    />
                    {record.reimbursement_mode} DISPATCH
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Coins className="h-3 w-3 text-indigo-500" /> Distribution
                  Strategy Scope
                </span>
                {isEditing ? (
                  <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsBulk(false)}
                      className={cn(
                        "py-1 text-[11px] font-bold rounded-md transition-all",
                        !isBulk
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      SINGLE TRANSACTION
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBulk(true)}
                      className={cn(
                        "py-1 text-[11px] font-bold rounded-md transition-all",
                        isBulk
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      BULK MATRIX
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-slate-900 mt-1">
                    {isBulk
                      ? "BULK MATRIX PROCESSING FILE"
                      : "SINGLE TRANSACTION TARGET"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Package className="h-3 w-3 text-indigo-500" /> Reimbursement
                  Allocation Type
                </span>
                {isEditing ? (
                  <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setReimbursementType("BUNDLE")}
                      className={cn(
                        "py-1 text-[11px] font-bold rounded-md transition-all",
                        reimbursementType === "BUNDLE"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      BUNDLE
                    </button>
                    <button
                      type="button"
                      onClick={() => setReimbursementType("AIRTIME")}
                      className={cn(
                        "py-1 text-[11px] font-bold rounded-md transition-all",
                        reimbursementType === "AIRTIME"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      AIRTIME
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-slate-900 mt-1 uppercase">
                    {reimbursementType} ALLOCATION
                  </span>
                )}
              </div>
            </div>

            {/* Target Subscriber MSISDN Input */}
            {!isBulk && (
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs animate-in fade-in duration-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3 w-3 text-indigo-500" /> Target
                  Subscriber Number (MSISDN)
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. 233XXXXXXXXX"
                    value={msisdn}
                    onChange={(e) => setMsisdn(e.target.value)}
                    className="mt-1.5 w-full max-w-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono outline-none focus:border-indigo-500 transition-colors"
                  />
                ) : (
                  <span className="font-mono text-slate-900 font-bold text-sm mt-0.5">
                    {msisdn || "No targeted subscriber assigned"}
                  </span>
                )}
              </div>
            )}

            {/* Target Allocations Configuration Options */}
            <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Package className="h-3 w-3 text-indigo-500" /> Asset Targeted
                Metrics Selection
              </span>

              {isEditing ? (
                reimbursementType === "BUNDLE" ? (
                  <div className="flex flex-col gap-3 mt-1.5">
                    <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
                      {MOCK_BUNDLE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setTargetProductId("");
                          }}
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all border",
                            selectedCategory === cat
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-slate-800 font-bold text-left shadow-sm"
                      >
                        <span className="truncate">{selectedBundleName}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-slate-400 transition-transform duration-200",
                            isOpenDropdown && "transform rotate-180",
                          )}
                        />
                      </button>

                      {isOpenDropdown && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1.5 max-h-56">
                          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                            <Search className="h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search current category list items..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-transparent text-[11px] font-medium outline-none text-slate-700"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-y-auto">
                            {filteredBundles.length === 0 ? (
                              <div className="text-center p-3 text-slate-400 text-[10px] font-mono">
                                No matching bundles found...
                              </div>
                            ) : (
                              filteredBundles.map((bundle) => (
                                <button
                                  key={bundle.id}
                                  type="button"
                                  onClick={() => {
                                    setTargetProductId(bundle.id);
                                    setIsOpenDropdown(false);
                                    setSearchQuery("");
                                  }}
                                  className={cn(
                                    "w-full text-left p-2 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors",
                                    targetProductId === bundle.id
                                      ? "bg-indigo-600 text-white font-bold"
                                      : "text-slate-700 hover:bg-slate-50",
                                  )}
                                >
                                  <span>{bundle.name}</span>
                                  <span
                                    className={cn(
                                      "font-mono text-[10px]",
                                      targetProductId === bundle.id
                                        ? "text-indigo-100"
                                        : "text-slate-400",
                                    )}
                                  >
                                    {bundle.price}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-1.5 max-w-xs">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono text-[11px]">
                      CFA
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-11 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                )
              ) : (
                <span className="font-bold text-slate-900 mt-0.5 font-mono text-xs">
                  {reimbursementType === "BUNDLE"
                    ? targetProductId || "None chosen"
                    : `AIRTIME AMOUNT: CFA ${Number(amount || 0).toFixed(2)}`}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3 w-3 text-indigo-500" /> Business
                Justification & Notes
              </span>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium outline-none resize-none"
                />
              ) : (
                <p className="text-slate-700 font-medium leading-relaxed mt-0.5">
                  {description || "No notes provided."}
                </p>
              )}
            </div>
          </div>

          {/* Bulk Matrix File Interface Module */}
          {isBulk && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Bulk Ledger Distribution Source Management
                </h3>
              </div>

              {/* Description Reference + File Action Downloader */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-slate-50/70 border border-slate-200/60 rounded-xl p-3">
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Ledger Token Reference
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                      {newFileReferenceId
                        ? newFileReferenceId
                        : currentFileReferenceId || "No active file reference"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      Count:{" "}
                      <span className="text-slate-900 font-mono">
                        {bulkMetrics.total}
                      </span>{" "}
                      subscribers
                    </span>
                    {newFileReferenceId && (
                      <span className="text-[10px] text-indigo-600 font-bold animate-pulse">
                        (Staged Overwrite)
                      </span>
                    )}
                  </div>
                </div>

                {record.input_file_url && !newFileReferenceId && (
                  <button
                    type="button"
                    disabled={isDownloadingInput}
                    onClick={handleSecureInputDownload}
                    className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-2 border border-emerald-200/60 rounded-lg hover:bg-emerald-100/70 transition-colors shadow-sm disabled:opacity-50 h-8"
                  >
                    <FileDown className="h-3.5 w-3.5" />{" "}
                    {isDownloadingInput
                      ? "Streaming..."
                      : "Download Original Input"}
                  </button>
                )}
              </div>

              {/* Dynamic Bottom Input Dropzones */}
              {isEditing ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {renderFileZone()}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 text-center text-slate-400 text-xs font-bold font-mono flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  SUBSCRIBER DATA LOCKED • EDIT WORKSPACE TO STAGE DATA
                  REPLACEMENTS
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Grid */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">
              Workflow Status Tracks
            </h2>
            {getStatusBadge(record.status)}

            <div className="flex flex-col gap-2.5 text-[11px] font-medium text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3 w-3" /> Requested By:
                </span>
                <span className="font-bold text-slate-700 font-mono">
                  {record.requester_name ||
                    `User ID #${record.requested_by_user_id}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Registered On:
                </span>
                <span className="font-bold text-slate-700">
                  {new Date(record.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">
              Evidence Documents ({attachments.length})
            </h2>

            {isEditing && (
              <label className="border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-indigo-600 shadow-sm group">
                <Paperclip className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {isUploading
                  ? "Uploading file stream..."
                  : "Append Support Document Attachment"}
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}

            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {attachments.length === 0 ? (
                <div className="text-center p-4 bg-slate-50 rounded-xl text-slate-400 text-[10px] font-medium border border-slate-100">
                  No verification attachments found.
                </div>
              ) : (
                attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span
                        className="truncate text-slate-800 font-bold text-[11px]"
                        title={att.name}
                      >
                        {att.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {record.attachments?.find(
                        (raw: any) => String(raw.id) === att.id,
                      )?.file_url && (
                        <a
                          href={
                            record.attachments.find(
                              (raw: any) => String(raw.id) === att.id,
                            )?.file_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Overlay Dialog Box Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Confirm
                Approval
              </h3>
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="text-xs font-medium text-slate-600 leading-relaxed">
                Are you sure you want to approve this reimbursement allocation
                context? This operation commits data parameters to the active
                processing layers.
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-2.5 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="h-8 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActioning}
                  className="h-8 px-3.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isActioning ? "Processing..." : "Confirm Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Overlay Dialog Box Modal Shell */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-500" /> Provide
                Rejection Reason
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Explanation / Context Notes
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this reimbursement ledger payload request is explicitly denied..."
                  className="w-full text-xs font-medium font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-700 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-2.5 border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectionReason("");
                  }}
                  className="h-8 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActioning || !rejectionReason.trim()}
                  className="h-8 px-3.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isActioning ? "Processing..." : "Confirm Denial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Overlay Dialog Box Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Ban className="h-4 w-4 text-slate-500" /> Cancel Request
              </h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="text-xs font-medium text-slate-600 leading-relaxed">
                Are you sure you want to cancel this pending reimbursement
                request? This state mutation transitions the item into an
                inactive ledger log.
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-2.5 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="h-8 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isActioning}
                  className="h-8 px-3.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isActioning ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderFileZone() {
    if (isProcessingFile) {
      return (
        <div className="border border-dashed border-indigo-200 bg-indigo-50/20 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2">
          <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-indigo-700">
            Streaming and validating file structure arrays...
          </span>
        </div>
      );
    }

    if (!uploadedFile) {
      return (
        <div className="flex flex-col gap-2">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0])
                handleFileIngestion(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative"
          >
            <input
              type="file"
              accept=".csv, .txt, .xlsx, .xls"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileIngestion(e.target.files[0]);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 block">
                Drag & drop spreadsheet revision matrix, or browse local volumes
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Limits layout specifications: Max structural allowance 10MB
              </span>
            </div>
          </div>

          <div className="flex justify-end relative" ref={templateDropdownRef}>
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
              className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-3 w-3" />{" "}
              {isDownloading ? "Exporting..." : "Export Blank Template Schema"}{" "}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>

            {isTemplateDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 shadow-xl rounded-lg w-40 py-1 z-50 animate-in fade-in slide-in-from-bottom-1 duration-100">
                {(["xlsx", "csv", "txt"] as TemplateFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      handleCurrentSubscriberDownload(fmt);
                      setIsTemplateDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 block transition-colors"
                  >
                    Export .{fmt.toUpperCase()} Format
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 bg-white p-3 border border-slate-200 rounded-xl animate-in fade-in duration-200">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileText className="h-4 w-4 text-indigo-500" />
            <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
            <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 rounded border border-indigo-100">
              {newFileReferenceId}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUploadedFile(null);
              setNewFileReferenceId(null);
              setBulkErrors([]);
            }}
            className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">
              Staged Record Rows
            </span>
            <span className="text-sm font-black text-slate-700">
              {bulkMetrics.total}
            </span>
          </div>
          <div className="bg-green-50/40 rounded-lg p-2 border border-green-100">
            <span className="text-[9px] font-bold text-green-500 block uppercase">
              Validated Elements
            </span>
            <span className="text-sm font-black text-green-700 flex items-center justify-center gap-0.5">
              <CheckCircle2 className="h-3 w-3 text-green-500" />{" "}
              {bulkMetrics.valid}
            </span>
          </div>
          <div className="bg-red-50/40 rounded-lg p-2 border border-red-100">
            <span className="text-[9px] font-bold text-red-500 block uppercase">
              Rejected Errors
            </span>
            <span className="text-sm font-black text-red-700 flex items-center justify-center gap-0.5">
              <AlertCircle className="h-3 w-3 text-red-500" />{" "}
              {bulkMetrics.invalid}
            </span>
          </div>
        </div>

        {bulkErrors.length > 0 && (
          <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">
              Ingesting Fault Diagnostics Logs
            </span>
            <div className="border border-red-100 rounded-lg overflow-hidden text-[11px] bg-white max-h-40 overflow-y-auto shadow-inner">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-red-50 z-10 text-red-700 font-bold text-left">
                  <tr className="border-b border-red-100">
                    <th className="p-2 w-16">Row ID</th>
                    <th className="p-2 w-32">Identifier</th>
                    <th className="p-2">
                      Failure Reason Description Framework
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50 text-slate-600 font-medium">
                  {bulkErrors.map((err, idx) => (
                    <tr
                      key={`${err.row}-${idx}`}
                      className="hover:bg-red-50/20 transition-colors"
                    >
                      <td className="p-2 font-bold font-mono text-red-600">
                        Row {err.row}
                      </td>
                      <td className="p-2 font-mono text-slate-500 break-all">
                        {err.identifier}
                      </td>
                      <td className="p-2 text-slate-500 leading-relaxed text-xs">
                        {err.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}
