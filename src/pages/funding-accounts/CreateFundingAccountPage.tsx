import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/hooks/useToastStore";
import { fundingAccountsService } from "@/services/fundingAccountsService";

export default function CreateFundingAccountPage() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [name, setName] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msisdn.trim()) {
      return showToast(
        "Account name and MSISDN are strictly required.",
        "error",
      );
    }

    const payload = {
      name: name.trim(),
      msisdn: msisdn.trim(),
      description: description.trim() || null,
      is_active: isActive,
    };

    setIsSubmitting(true);
    try {
      await fundingAccountsService.createAccount(payload);
      showToast("Funding account successfully created.", "success");
      navigate("/funding-accounts");
    } catch (err) {
      showToast("Failed to register funding account node.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/funding-accounts")}
          type="button"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm text-slate-500 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Create Funding Account
        </h1>
      </div>

      <form
        onSubmit={handleSubmitForm}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Account Specifications
          </span>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all shadow-sm",
              isActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-500",
            )}
          >
            {isActive ? (
              <>
                <ToggleRight className="h-4 w-4 text-emerald-600" /> Initial
                State: Active
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 text-slate-400" /> Initial State:
                Deactivated
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <User className="h-3 w-3 text-slate-400" /> Account Name{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Corporate Disbursement Account"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Phone className="h-3 w-3 text-slate-400" /> MSISDN (Phone
            Identifier) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. +242066000000"
            value={msisdn}
            onChange={(e) => setMsisdn(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <FileText className="h-3 w-3 text-slate-400" /> Description
          </label>
          <textarea
            rows={3}
            placeholder="Optional context or internal notes describing this payment route..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/funding-accounts")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:bg-slate-200 transition-all active:scale-95"
          >
            {isSubmitting ? "Saving..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
