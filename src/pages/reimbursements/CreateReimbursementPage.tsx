// src/pages/reimbursements/CreateReimbursementPage.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Users,
  Layers,
  Ticket,
  Package,
  Coins,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  ChevronDown,
  Search,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/hooks/useToastStore";
import {
  reimbursementsService,
  type ReimbursementCreationPayload,
} from "@/services/reimbursementsService";

type DistributionMode = "SINGLE_SINGLE" | "MANY_SINGLE" | "MANY_MANY";
type AssetType = "BUNDLE" | "AIRTIME";
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
    price: "GHS 10.00",
  },
  {
    id: "DATA_WEEKLY_5GB",
    name: "Weekly Super Surf 5GB",
    category: "Data",
    price: "GHS 50.00",
  },
  {
    id: "VOICE_MONTHLY_600M",
    name: "TalkMore Monthly 600 Mins",
    category: "Voice",
    price: "GHS 30.00",
  },
  {
    id: "SMS_BATCH_500",
    name: "Enterprise Bulk 500 SMS Pack",
    category: "SMS",
    price: "GHS 5.00",
  },
  {
    id: "COMBO_BIZ_PREMIUM",
    name: "Executive Uncapped Combo Bundle",
    category: "Combo",
    price: "GHS 250.00",
  },
];

export default function CreateReimbursementPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  // --- GENERAL FORM METADATA ---
  const [ticketId, setTicketId] = useState("");
  const [reimbursementMode, setReimbursementMode] = useState<"AUTO" | "MANUAL">(
    "AUTO",
  );
  const [description, setDescription] = useState("");
  const [distributionMode, setDistributionMode] =
    useState<DistributionMode>("SINGLE_SINGLE");

  // --- ASSET CONFIGURATION & CASCADE SEARCH SELECTORS ---
  const [reimbursementType, setReimbursementType] =
    useState<AssetType>("BUNDLE");
  const [selectedCategory, setSelectedCategory] = useState("Data");
  const [targetProductId, setTargetProductId] = useState("");
  const [amount, setAmount] = useState("");

  // Custom Searchable Dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- SUBSCRIBER CAPTURE TARGETS ---
  const [singleMsisdn, setSingleMsisdn] = useState("");

  // --- LIVE BULK INGESTION FILE STATES ---
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileReferenceId, setFileReferenceId] = useState<string | null>(null);
  const [bulkMetrics, setBulkMetrics] = useState<IngestionMetrics>({
    total: 0,
    valid: 0,
    invalid: 0,
  });
  const [bulkErrors, setBulkErrors] = useState<ValidationErrorLog[]>([]);

  // --- EVIDENCE ATTACHMENTS LAYER ---
  const [attachments, setAttachments] = useState<
    { id: string | number; name: string; size: string }[]
  >([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [templateFormat, setTemplateFormat] = useState<TemplateFormat>("xlsx");

  // Close the template dropdown when clicking outside
  useEffect(() => {
    function handleOutsideDropdownClick(event: MouseEvent) {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideDropdownClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideDropdownClick);
  }, []);

  // Close combobox search window on outer click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products by category and input text
  const filteredBundles = useMemo(() => {
    return MOCK_BUNDLES_DB.filter(
      (b) =>
        b.category === selectedCategory &&
        b.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [selectedCategory, searchQuery]);

  const currentSelectedBundleName = useMemo(() => {
    const found = MOCK_BUNDLES_DB.find((b) => b.id === targetProductId);
    return found
      ? `${found.name} (${found.price})`
      : "Select a bundle catalog item...";
  }, [targetProductId]);

  // --- DYNAMIC LIVE FILE TEMPLATE DOWNLOAD HANDLER ---
  const handleTemplateDownload = async () => {
    try {
      setIsDownloading(true);

      // Consume the service layer function by passing the component's state values
      await reimbursementsService.downloadTemplate(
        distributionMode,
        templateFormat,
      );

      showToast(
        "Template spreadsheet layout saved to downloads directory.",
        "success",
      );
    } catch (error) {
      console.error("Template down-stream extraction workflow failure:", error);
      showToast(
        "Failed to retrieve target template structure from API.",
        "error",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // --- REAL BACK-END REIMBURSEMENT BATCH INGESTION CONTROLLER ---
  const handleFileIngestion = async (file: File) => {
    setIsProcessingFile(true);
    setBulkErrors([]);

    try {
      // Execute the live validation API call via the service layer
      const response = await reimbursementsService.validateInboundSheet(
        file,
        distributionMode,
      );

      if (response.success) {
        setUploadedFile(file);
        setFileReferenceId(response.file_reference_id);
        setBulkMetrics(response.metrics);
        setBulkErrors(response.errors || []);

        if (response.metrics.invalid > 0) {
          showToast(
            `Data matrix parsed with ${response.metrics.invalid} ingestion layout rule conflicts.`,
            "error",
          );
        } else {
          showToast(
            "Subscriber mapping file streams parsed successfully without defects.",
            "success",
          );
        }
      } else {
        throw new Error(
          response.message || "File rejected by edge structural validation.",
        );
      }
    } catch (err: any) {
      setUploadedFile(null);
      setFileReferenceId(null);
      showToast(
        err?.message ||
          "Failed to parse data matrix sheet. Please ensure column layout criteria are satisfied.",
        "error",
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  // --- FIXED EVIDENCE ATTACHMENT UPLOAD CONTROLLER ---
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAttachment(true);

    try {
      const uploadedItems: { id: string; name: string; size: string }[] = [];

      for (const file of Array.from(files)) {
        // 1. Post file stream to server
        const response =
          await reimbursementsService.uploadEvidenceAttachment(file);

        // 2. Safely capture the nested payload data block returned by your controller
        const serverPayload = (response as any).data;

        if (serverPayload && serverPayload.id) {
          uploadedItems.push({
            id: serverPayload.id, // Extracts the string UUID safely
            name: serverPayload.file_name, // Extracts "Fiche hebdomadaire de Suivi 05 juin 2026.pdf"
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          });
        }
      }

      setAttachments((prev) => [...prev, ...uploadedItems]);
      showToast(
        `Uploaded ${files.length} attachment(s) successfully.`,
        "success",
      );
    } catch (error: any) {
      console.error("Attachment upload error:", error);
      showToast("Failed to upload evidence files to server.", "error");
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (id: string | number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    showToast("Evidence log attachment cleared", "success");
  };

  // --- FINAL PAYLOAD COMPILE AND SUBMIT ---
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketId.trim())
      return showToast("Trouble Ticket identifier number is required", "error");

    // CORRECT CODE TO PATCH IN THE FORM SUBMISSION BLOCK ✅
    const payload: ReimbursementCreationPayload = {
      ticket_id: ticketId,
      reimbursement_type: reimbursementType,
      reimbursement_mode: reimbursementMode,
      is_bulk: distributionMode !== "SINGLE_SINGLE", // or true if using file ingestions
      description: description,
      target_product_id:
        reimbursementType === "BUNDLE" ? targetProductId : undefined,
      amount: reimbursementType === "AIRTIME" ? Number(amount) : undefined,
      msisdn: distributionMode === "SINGLE_SINGLE" ? singleMsisdn : undefined,
      file_reference_id: fileReferenceId || undefined,

      // Strict reference array generation: Extract the 'id' parameter
      // and guarantee that no empty/null elements bypass into the payload
      attachment_ids: attachments
        .map((att) => att.id)
        .filter((id) => id !== null && id !== undefined && id !== ""),
    };

    if (distributionMode === "SINGLE_SINGLE") {
      if (!singleMsisdn.trim())
        return showToast("Subscriber MSISDN parameter required", "error");
      payload.msisdn = singleMsisdn.trim();
      if (reimbursementType === "BUNDLE") {
        if (!targetProductId)
          return showToast(
            "Select target asset package model mapping",
            "error",
          );
        payload.target_product_id = targetProductId;
      } else {
        if (!amount || parseFloat(amount) <= 0)
          return showToast("Specify valid airtime value", "error");
        payload.amount = parseFloat(amount);
      }
    } else {
      if (!fileReferenceId)
        return showToast(
          "Please attach an initialization target source sheet",
          "error",
        );

      payload.file_reference_id = fileReferenceId;
      if (distributionMode === "MANY_SINGLE") {
        if (reimbursementType === "BUNDLE") {
          if (!targetProductId)
            return showToast(
              "Select active template package mapping key",
              "error",
            );
          payload.target_product_id = targetProductId;
        } else {
          if (!amount || parseFloat(amount) <= 0)
            return showToast(
              "Specify shared airtime deployment amount",
              "error",
            );
          payload.amount = parseFloat(amount);
        }
      }
    }

    setIsSubmitting(true);
    try {
      await reimbursementsService.createReimbursement(payload);
      showToast(
        "Adjustment records successfully submitted into checking stream logs",
        "success",
      );
      navigate("/reimbursements");
    } catch (err) {
      showToast(
        "Endpoint validation error initializing database asset logs",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER STRIP */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/reimbursements")}
          type="button"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm text-slate-500 hover:text-slate-900 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Initialize Resource Reimbursement
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Define trouble parameters explicitly and configure dynamic
            resolution mappings.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmitForm}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* LEFT COMPONENT COLUMN BUILDER PANEL */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* SECTION 1: SYSTEM PARAMETERS CORE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Trouble Ticket Registry Context
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Trouble Ticket Reference Number{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TT-2026-1092"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Execution Routing Stream
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReimbursementMode("AUTO")}
                    className={cn(
                      "py-1.5 text-[10px] font-bold rounded-lg transition-all",
                      reimbursementMode === "AUTO"
                        ? "bg-white text-indigo-600 shadow-sm font-black"
                        : "text-slate-500",
                    )}
                  >
                    ⚡ AUTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setReimbursementMode("MANUAL")}
                    className={cn(
                      "py-1.5 text-[10px] font-bold rounded-lg transition-all",
                      reimbursementMode === "MANUAL"
                        ? "bg-white text-amber-600 shadow-sm font-black"
                        : "text-slate-500",
                    )}
                  >
                    📋 MANUAL
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">
                Operational Summary Context / Justification Log
              </label>
              <textarea
                rows={2}
                required
                placeholder="State explicit procedural grounds explaining adjustments (e.g. Subscriber account debited during batch drop...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: TARGET ALLOCATION SWITCHER PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Target Ingestion Distribution Mapping
              </h2>
            </div>

            {/* THREE WAY SWITCH PANEL MODULE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setDistributionMode("SINGLE_SINGLE");
                  setUploadedFile(null);
                  setFileReferenceId(null);
                  setBulkErrors([]);
                }}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all",
                  distributionMode === "SINGLE_SINGLE"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                <User className="h-4 w-4" />
                <span>Single Target User</span>
                <span className="text-[9px] text-slate-400 font-medium font-mono">
                  1 MSISDN ➔ 1 Product
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDistributionMode("MANY_SINGLE");
                  setUploadedFile(null);
                  setFileReferenceId(null);
                  setBulkErrors([]);
                }}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all",
                  distributionMode === "MANY_SINGLE"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                <Users className="h-4 w-4" />
                <span>Batch Group User</span>
                <span className="text-[9px] text-slate-400 font-medium font-mono">
                  Many MSISDN ➔ 1 Product
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDistributionMode("MANY_MANY");
                  setUploadedFile(null);
                  setFileReferenceId(null);
                  setBulkErrors([]);
                }}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all",
                  distributionMode === "MANY_MANY"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                <Layers className="h-4 w-4" />
                <span>Complex Matrix Ingest</span>
                <span className="text-[9px] text-slate-400 font-medium font-mono">
                  Many MSISDN ➔ Varied Rows
                </span>
              </button>
            </div>

            {/* DISTRIBUTION INNER DATA FIELDS */}
            <div className="mt-2 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              {distributionMode === "SINGLE_SINGLE" && (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-600">
                    Target Subscriber MSISDN{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 242067390275"
                    value={singleMsisdn}
                    onChange={(e) => setSingleMsisdn(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              )}

              {distributionMode !== "SINGLE_SINGLE" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between relative z-40">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">
                        Upload Data Source Sheet Matrix
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {distributionMode === "MANY_SINGLE"
                          ? "Provide single column list of valid MSISDN elements."
                          : "Provide columns matching: msisdn, target_product_id."}
                      </span>
                    </div>

                    <div className="relative" ref={templateDropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsTemplateDropdownOpen(!isTemplateDropdownOpen)
                        }
                        className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors active:scale-95"
                      >
                        <Download className="h-3 w-3" /> Get Template{" "}
                        <ChevronDown className="h-2.5 w-2.5" />
                      </button>

                      {isTemplateDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg w-28 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                          {(["xlsx", "csv", "txt"] as TemplateFormat[]).map(
                            (fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => {
                                  setTemplateFormat(fmt);
                                  handleTemplateDownload();
                                  setIsTemplateDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 block transition-colors"
                              >
                                .{fmt.toUpperCase()} Schema
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {renderFileZone()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN PANEL: ASSET SPECIFICATION & ATTACHMENTS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* SECTION 3: ASSET CONFIGURATION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Asset Allocation Engine Mapping
              </h2>
            </div>

            {distributionMode === "MANY_MANY" ? (
              <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 text-center flex flex-col items-center justify-center gap-1 text-indigo-900 animate-in fade-in duration-200">
                <Layers className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-bold">
                  Dynamic Spreadsheet Extraction Active
                </span>
                <p className="text-[10px] text-indigo-600/80 leading-relaxed px-2">
                  Package targets and value allocations are systematically
                  evaluated row-by-row within the file payload instance mapping
                  layer.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Reimbursement Resource Base Profile
                  </label>
                  <select
                    value={reimbursementType}
                    onChange={(e) => {
                      setReimbursementType(e.target.value as AssetType);
                      setTargetProductId("");
                      setAmount("");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="BUNDLE">
                      Bundle Provisioning Dynamic Catalog Item
                    </option>
                    <option value="AIRTIME">
                      Airtime Transfer Account Topup Ledger
                    </option>
                  </select>
                </div>

                {reimbursementType === "BUNDLE" ? (
                  <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">
                        Package Group Category
                      </label>
                      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {MOCK_BUNDLE_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setTargetProductId("");
                            }}
                            className={cn(
                              "flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all text-center",
                              selectedCategory === cat
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800",
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      className="flex flex-col gap-1.5 relative"
                      ref={dropdownRef}
                    >
                      <label className="text-xs font-bold text-slate-600">
                        Select Specific Asset Bundle Mapping
                      </label>
                      <div
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-bold flex items-center justify-between cursor-pointer focus:border-indigo-500 transition-colors"
                      >
                        <span
                          className={cn(
                            !targetProductId && "text-slate-400 font-normal",
                          )}
                        >
                          {currentSelectedBundleName}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </div>

                      {isSearchOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 flex flex-col gap-2 max-h-60 overflow-y-auto animate-in slide-in-from-top-1 duration-150">
                          <div className="relative flex items-center">
                            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search package listings by token tag or cost parameters..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500 font-medium"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {filteredBundles.length === 0 ? (
                              <span className="text-[11px] text-center text-slate-400 py-3 font-medium">
                                No system catalog packages found matching
                                parameter inputs.
                              </span>
                            ) : (
                              filteredBundles.map((pkg) => (
                                <div
                                  key={pkg.id}
                                  onClick={() => {
                                    setTargetProductId(pkg.id);
                                    setIsSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className={cn(
                                    "w-full px-3 py-2 text-[11px] rounded-lg font-bold flex items-center justify-between cursor-pointer transition-colors",
                                    targetProductId === pkg.id
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "hover:bg-slate-50 text-slate-700",
                                  )}
                                >
                                  <span>{pkg.name}</span>
                                  <span className="font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600">
                                    {pkg.price}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                    <label className="text-xs font-bold text-slate-600">
                      Airtime Cash Value Topup Amount (GHS)
                    </label>
                    <div className="relative">
                      <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: ATTACHMENTS & PROOF STORAGE LAYER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-indigo-600" />
                4. Operational Evidence Attachments
              </h2>
              <label className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                Add Evidence
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs font-medium bg-slate-50/50">
                No procedural evidence vouchers or receipts appended. Add
                configuration receipts to facilitate clear checker validation
                workflows.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs animate-in slide-in-from-top-1 duration-150"
                  >
                    {/* flex-1 and min-w-0 forces the flex container to respect text boundaries */}
                    <div className="flex items-center gap-2 font-semibold text-slate-700 min-w-0 flex-1 pr-4">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-500 shrink-0" />

                      {/* Name section with responsive truncation layout */}
                      <span
                        className="truncate text-slate-800 font-bold max-w-[240px] block"
                        title={att.name}
                      >
                        {att.name}
                      </span>

                      {/* Size Badge */}
                      <span className="text-[10px] font-mono font-normal text-slate-400 shrink-0">
                        ({att.size})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SYSTEM SUBMIT BAR */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/reimbursements")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Discard Form
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || isProcessingFile || isUploadingAttachment
              }
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:bg-slate-200 transition-all active:scale-95"
            >
              {isSubmitting ? "Queueing Entries..." : "Commit Asset Correction"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  // --- COMPACT LIVE BACK-END REGISTRY SUMMARY RENDERER ---
  function renderFileZone() {
    if (isProcessingFile) {
      return (
        <div className="border border-dashed border-indigo-200 bg-indigo-50/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-indigo-700">
            Streaming source data arrays to ledger rules validation engine...
          </span>
        </div>
      );
    }

    if (!uploadedFile) {
      return (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0])
              handleFileIngestion(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative"
        >
          <input
            type="file"
            accept=".csv, .txt, .xlsx, .xls"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileIngestion(e.target.files[0]);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 block">
              Drag & drop batch data matrix sheet layout, or browse local files
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Limits layout specifications: Max upload allowance 10MB
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 animate-in fade-in duration-200 bg-white p-3 border border-slate-200 rounded-xl">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileText className="h-4 w-4 text-indigo-500" />
            <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
            <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 rounded border border-indigo-100">
              {fileReferenceId}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUploadedFile(null);
              setFileReferenceId(null);
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
              Ingested Row Items
            </span>
            <span className="text-sm font-black text-slate-700">
              {bulkMetrics.total}
            </span>
          </div>
          <div className="bg-green-50/40 rounded-lg p-2 border border-green-100">
            <span className="text-[9px] font-bold text-green-500 block uppercase">
              Validated Targets
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

        {/* RENDERS LIVE ERROR LOG RECORDS ONLY IF AN UNMAPPED PARSING FAILURE OCCURS */}
        {bulkErrors.length > 0 && (
          <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">
              Ingestion Fault Diagnostics Logs
            </span>
            <div className="border border-red-100 rounded-lg overflow-hidden text-[11px] bg-white max-h-48 overflow-y-auto shadow-inner">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-red-50 z-10">
                  <tr className="border-b border-red-100 text-red-700 text-left font-bold">
                    <th className="p-2 w-16">Row ID</th>
                    <th className="p-2 w-32">Identifier</th>
                    <th className="p-2">
                      Failure Reason Description Framework
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50 text-slate-600 font-medium">
                  {bulkErrors.map((err, index) => (
                    <tr
                      key={`${err.row}-${index}`}
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
