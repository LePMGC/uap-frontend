import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  Calendar,
  Edit3,
  Save,
  X,
  Play,
  Octagon,
  Clock,
} from "lucide-react";
import { fundingAccountsService } from "@/services/fundingAccountsService";
import { useToastStore } from "@/hooks/useToastStore";
import { cn } from "@/lib/utils";

interface FundingAccount {
  id: string;
  name: string;
  msisdn: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function FundingAccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [record, setRecord] = useState<FundingAccount | null>(null);

  // Form parameters bind
  const [name, setName] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [description, setDescription] = useState("");

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fundingAccountsService.getAccountById(id);
      const data = response.data || response;

      setRecord(data);
      setName(data.name);
      setMsisdn(data.msisdn);
      setDescription(data.description || "");
    } catch (err) {
      showToast("Failed to pull account registry details.", "error");
      navigate("/funding-accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleToggleState = async () => {
    if (!id || !record) return;

    const nextState = !record.is_active;

    try {
      setIsActioning(true);

      await fundingAccountsService.updateAccount(id, {
        is_active: nextState,
      });

      showToast(
        `Account successfully ${nextState ? "activated" : "deactivated"}.`,
        "success",
      );

      setIsStateModalOpen(false);
      await fetchDetails();
    } catch (error) {
      showToast("Failed to update funding account state.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!id || !record) return;
    if (!name.trim() || !msisdn.trim())
      return showToast("Required standard parameter metrics missing.", "error");

    try {
      setIsSaving(true);
      await fundingAccountsService.updateAccount(id, {
        name: name.trim(),
        msisdn: msisdn.trim(),
        description: description.trim() || null,
      });
      showToast("Account configuration properties synchronized.", "success");
      setIsEditing(false);
      await fetchDetails();
    } catch (err) {
      showToast("Failed to modify database profile values.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 flex flex-col items-center justify-center text-xs font-mono font-bold text-slate-400 gap-2">
        <Clock className="h-5 w-5 text-indigo-500 animate-spin" /> SYNCHRONIZING
        CORE DATA...
      </div>
    );
  if (!record) return null;

  return (
    <div className="p-8 max-w-[700px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/funding-accounts")}
            className="h-8 w-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-md font-bold text-slate-900">
            Funding Account Details
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsStateModalOpen(true)}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border transition-all",
                record.is_active
                  ? "border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              )}
            >
              {record.is_active ? (
                <Octagon className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {record.is_active ? "Deactivate" : "Activate"}
            </button>
          )}

          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchDetails();
                }}
                disabled={isSaving}
                className="h-8 px-3 border rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5 inline mr-1" /> Discard
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-8 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Save className="h-3.5 w-3.5 inline mr-1" /> Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-8 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5 inline mr-1" /> Edit Properties
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            ID: {record.id}
          </span>
          <div
            className={cn(
              "px-2.5 py-0.5 border text-[10px] font-black tracking-wide uppercase rounded-full",
              record.is_active
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700",
            )}
          >
            ● {record.is_active ? "Active Link" : "Deactivated"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <User className="h-3 w-3 text-indigo-500" /> Account Label Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-white border rounded-lg text-slate-800 font-bold outline-none"
              />
            ) : (
              <span className="text-slate-900 font-bold mt-0.5">
                {record.name}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Phone className="h-3 w-3 text-indigo-500" /> MSISDN Terminal
              Route
            </span>
            {isEditing ? (
              <input
                type="text"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-white border rounded-lg text-slate-800 font-mono font-bold outline-none"
              />
            ) : (
              <span className="text-slate-900 font-mono font-bold mt-0.5">
                {record.msisdn}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <FileText className="h-3 w-3 text-indigo-500" /> System Description
            Narrative
          </span>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full p-2 bg-white border rounded-lg outline-none text-xs resize-none"
            />
          ) : (
            <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">
              {record.description || "No context data logged."}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-300" /> Created:{" "}
            {new Date(record.created_at).toLocaleString()}
          </div>
          {record.updated_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-300" /> Updated:{" "}
              {new Date(record.updated_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* State Switch Modal */}
      {isStateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 border-b pb-2">
              {record.is_active ? (
                <Octagon className="h-4 w-4 text-rose-500" />
              ) : (
                <Play className="h-4 w-4 text-emerald-500" />
              )}
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                {record.is_active ? "Deactivate Channel" : "Activate Channel"}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              {record.is_active
                ? "Are you sure you want to deactivate this account? System transactions utilizing this route identifier will immediately bounce."
                : "Are you sure you want to re-enable this target channel? This restores processing permissions instantly."}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStateModalOpen(false)}
                className="h-8 px-3 border rounded-lg text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActioning}
                onClick={handleToggleState}
                className={cn(
                  "h-8 px-3.5 text-white rounded-lg text-xs font-bold shadow-sm",
                  record.is_active
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                {isActioning
                  ? "Syncing..."
                  : record.is_active
                    ? "Confirm Deactivation"
                    : "Confirm Activation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
