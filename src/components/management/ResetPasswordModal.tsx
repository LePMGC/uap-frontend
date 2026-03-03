import { useState } from "react";
import {
  Key,
  Copy,
  Check,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { userService } from "@/services/userService";
import { useToastStore } from "@/hooks/useToastStore";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  user,
}: ResetPasswordModalProps) {
  const { showToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const response = await userService.resetPassword(user.id);
      setTempPassword(response.temporary_password);
      showToast("Password has been reset successfully.", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to reset password.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setTempPassword(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {!tempPassword ? (
          /* State 1: Confirmation */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Reset Password?
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              This will invalidate the current password for{" "}
              <span className="font-bold text-slate-700">{user.name}</span> and
              generate a new temporary one.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Yes, Reset it"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Display New Password */
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <Key className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              New Password Generated
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Please copy the password below and send it to{" "}
              <span className="font-bold">{user.email}</span>.
            </p>

            <div className="mt-8 relative group">
              <div className="p-5 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl relative overflow-hidden">
                <p className="text-2xl font-mono font-bold text-indigo-700 tracking-wider">
                  {tempPassword}
                </p>
                <button
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white rounded-xl shadow-md border border-indigo-100 hover:bg-indigo-50 transition-all active:scale-90"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-indigo-500" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] font-bold text-green-600 mt-2 animate-pulse">
                  Copied to clipboard!
                </p>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg transition-all active:scale-[0.98]"
            >
              Done <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
