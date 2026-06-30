// src/pages/reimbursements/ReimbursementDetailsPage.tsx
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
} from "lucide-react";
import {
  reimbursementsService,
  type ReimbursementItem,
} from "@/services/reimbursementsService";
import { useToastStore } from "@/hooks/useToastStore";
import { useAuthStore } from "@/store/authStore";
import { PERM } from "@/types/auth";
import { cn } from "@/lib/utils";

// Static database mapping for products exactly from the creation context framework
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
    name: "Weekly Super Data 5GB",
    category: "Data",
    price: "GHS 50.00",
  },
  {
    id: "DATA_MONTHLY_20GB",
    name: "Monthly Elite Data 20GB",
    category: "Data",
    price: "GHS 150.00",
  },
  {
    id: "VOICE_DAILY_MINS",
    name: "Daily Talk 50 Mins",
    category: "Voice",
    price: "GHS 5.00",
  },
  {
    id: "VOICE_MONTHLY_600M",
    name: "Monthly Corporate 600 Mins",
    category: "Voice",
    price: "GHS 80.00",
  },
  {
    id: "SMS_WEEKLY_MAX",
    name: "Weekly SMS Blast 500 SMS",
    category: "SMS",
    price: "GHS 12.00",
  },
  {
    id: "COMBO_WEEKLY_MED",
    name: "Weekly Hybrid Med Bundle",
    category: "Combo",
    price: "GHS 25.00",
  },
  {
    id: "INT_ZONE_A_ROAM",
    name: "International Roaming Zone A",
    category: "International",
    price: "GHS 200.00",
  },
];

export default function ReimbursementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth Permissions Checking
  const currentUser = useAuthStore((state) => state.user);
  const userPermissions = useMemo(
    () => currentUser?.permissions || [],
    [currentUser],
  );
  const canModify =
    userPermissions.includes(PERM.CREATE_SINGLE_REIMBURSEMENTS) ||
    userPermissions.includes(PERM.CREATE_BULK_REIMBURSEMENTS);

  // Structural Workflow States
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [record, setRecord] = useState<ReimbursementItem | null>(null);

  // Core Form State for Edit Mode
  const [ticketId, setTicketId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [reimbursementType, setReimbursementType] = useState<
    "BUNDLE" | "AIRTIME"
  >("BUNDLE");
  const [reimbursementMode, setReimbursementMode] = useState<"AUTO" | "MANUAL">(
    "AUTO",
  );
  const [targetProductId, setTargetProductId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size?: string }[]
  >([]);

  // Custom Editable Dropdown Search States
  const [selectedCategory, setSelectedCategory] = useState<string>("Data");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Close custom bundle dropdown when clicking outside boundary
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter bundles by Category and Search query input text
  const filteredBundles = useMemo(() => {
    return MOCK_BUNDLES_DB.filter(
      (b) =>
        b.category === selectedCategory &&
        (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [selectedCategory, searchQuery]);

  // Read currently selected target bundle display name text context safely
  const selectedBundleName = useMemo(() => {
    const bundle = MOCK_BUNDLES_DB.find((b) => b.id === targetProductId);
    return bundle
      ? `${bundle.name} (${bundle.price})`
      : "Choose explicit product schema...";
  }, [targetProductId]);

  // Fetch record details from server and map into working form states
  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await reimbursementsService.getReimbursementDetails(id);
      const data = (response as any).data;

      if (!data) {
        throw new Error(
          "Missing structural item block wrapper data exceptions.",
        );
      }

      setRecord(data);

      // Initialize active modification state context values
      setTicketId(data.ticket_id);
      setDescription(data.description || "");
      setReimbursementType(data.reimbursement_type);
      setReimbursementMode(data.reimbursement_mode);
      setTargetProductId(data.target_product_id || "");
      setAmount(
        data.amount !== null && data.amount !== undefined
          ? String(data.amount)
          : "",
      );

      if (data.target_product_id) {
        const matchingBundle = MOCK_BUNDLES_DB.find(
          (b) => b.id === data.target_product_id,
        );
        if (matchingBundle) {
          setSelectedCategory(matchingBundle.category);
        }
      }

      if (data.attachments) {
        setAttachments(
          data.attachments.map((att: any) => ({
            id: String(att.id),
            name: att.file_name,
          })),
        );
      }
    } catch (err) {
      console.error("Details page retrieval exception loop trace error:", err);
      showToast(
        "Failed to retrieve structural details for this reimbursement.",
        "error",
      );
      navigate("/reimbursements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newItems: { id: string; name: string; size: string }[] = [];
      for (const file of Array.from(files)) {
        const response =
          await reimbursementsService.uploadEvidenceAttachment(file);
        const serverPayload = (response as any).data;
        if (serverPayload && serverPayload.id) {
          newItems.push({
            id: serverPayload.id,
            name: serverPayload.file_name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          });
        }
      }
      setAttachments((prev) => [...prev, ...newItems]);
      showToast(
        "New support evidence vouchers linked successfully.",
        "success",
      );
    } catch (err) {
      showToast(
        "Failed to post file attachments up to storage layer.",
        "error",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (targetId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== targetId));
  };

  // Build payload configuration mappings and fire down to backend service layer
  const handleSaveChanges = async () => {
    if (!id || !record) return;
    if (!ticketId.trim()) {
      showToast(
        "Trouble Ticket ID descriptor framework cannot be blank.",
        "error",
      );
      return;
    }
    if (reimbursementType === "BUNDLE" && !targetProductId) {
      showToast("Please choose a target product catalog identifier.", "error");
      return;
    }
    if (reimbursementType === "AIRTIME" && (!amount || Number(amount) <= 0)) {
      showToast(
        "Please key in a valid numerical Airtime face value amount.",
        "error",
      );
      return;
    }

    try {
      setIsSaving(true);
      await reimbursementsService.updateReimbursement(id, {
        ticket_id: ticketId,
        description: description,
        reimbursement_type: reimbursementType,
        reimbursement_mode: reimbursementMode,
        target_product_id:
          reimbursementType === "BUNDLE" ? targetProductId : undefined, // Change from null to undefined
        amount: reimbursementType === "AIRTIME" ? Number(amount) : undefined, // Change from null to undefined
        attachment_ids: attachments.map((a) => a.id),
      });
      showToast(
        "Reimbursement parameter metrics updated successfully.",
        "success",
      );
      setIsEditing(false);
      await fetchDetails();
    } catch (err) {
      showToast("Failed to save changes to the central queue ledger.", "error");
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
        LOADING SYSTEM METRICS TRANSACTION LOGS...
      </div>
    );
  }

  if (!record) return null;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/reimbursements")}
            className="h-9 w-9 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-all hover:scale-95 shadow-sm"
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

        {record.status === "pending" && canModify && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchDetails(); // Discard and reset states
                  }}
                  disabled={isSaving}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
                >
                  <X className="h-3.5 w-3.5" /> Discard
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving || isUploading}
                  className="h-9 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm shadow-indigo-100 transition-colors disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />{" "}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="h-9 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Request Form
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">
              Primary Parameter Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
              {/* Troubleshooting ticket input box */}
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
                    {record.ticket_id}
                  </span>
                )}
              </div>

              {/* Reimbursement Mode Selection Toggle */}
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

              {/* Strategy Scope Label Type View */}
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Coins className="h-3 w-3 text-indigo-500" /> Distribution
                  Strategy Scope
                </span>
                <span className="font-bold text-slate-900 mt-1">
                  {(record as any).is_bulk
                    ? "BULK MATRIX PROCESSING FILE"
                    : "SINGLE TRANSACTION TARGET"}
                </span>
              </div>

              {/* Asset Type Selector Layout (Bundle vs Airtime toggle mechanism) */}
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
                    {record.reimbursement_type} ALLOCATION
                  </span>
                )}
              </div>
            </div>

            {/* Target Product Selection Fields - Dynamic display logic block matching wizard flow */}
            <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Package className="h-3 w-3 text-indigo-500" /> Asset Targeted
                Metrics Selection
              </span>

              {isEditing ? (
                reimbursementType === "BUNDLE" ? (
                  <div className="flex flex-col gap-3 mt-1.5">
                    {/* Category Tabs inside edit dashboard layout view */}
                    <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
                      {MOCK_BUNDLE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setTargetProductId(""); // Reset bundle selection row inside category context updates
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

                    {/* Custom Editable Dropdown Combo Field */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-slate-800 font-bold text-left shadow-sm focus:border-indigo-500 transition-colors"
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

                          <div className="flex flex-col gap-0.5 overflow-y-auto pr-1">
                            {filteredBundles.length === 0 ? (
                              <div className="text-center p-3 text-slate-400 text-[10px] font-medium font-mono">
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
                  /* Airtime numerical text allocation box layout */
                  <div className="relative mt-1.5 max-w-xs">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono text-[11px]">
                      GHS
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-11 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )
              ) : (
                /* Read only display format */
                <span className="font-bold text-slate-900 mt-0.5 font-mono text-xs">
                  {record.reimbursement_type === "BUNDLE"
                    ? record.target_product_id
                    : `AIRTIME AMOUNT: GHS ${Number(record.amount || 0).toFixed(2)}`}
                </span>
              )}
            </div>

            {/* Description Notes */}
            <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3 w-3 text-indigo-500" /> Business
                Justification & Notes
              </span>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              ) : (
                <p className="text-slate-700 font-medium leading-relaxed mt-0.5">
                  {record.description ||
                    "No procedural justification notes provided."}
                </p>
              )}
            </div>

            {record.rejection_reason && (
              <div className="flex flex-col gap-1.5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 font-medium">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Rejection Conflict Explanation
                  Reason
                </span>
                <p className="leading-relaxed font-semibold">
                  {record.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6">
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

          {/* Evidence Upload & Display Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">
              Evidence Documents ({attachments.length})
            </h2>

            {isEditing && (
              <label className="border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-indigo-600 shadow-sm group">
                <Paperclip className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {isUploading
                  ? "Uploading file byte stream..."
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
                  No structural verification attachments found.
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
                      {record.attachments.find(
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
    </div>
  );
}
