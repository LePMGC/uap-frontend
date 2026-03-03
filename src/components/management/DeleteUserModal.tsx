import { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { userService } from "@/services/userService";
import { useToastStore } from "@/hooks/useToastStore";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onSuccess: () => void;
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: DeleteUserModalProps) {
  const { showToast } = useToastStore();
  const [confirmKey, setConfirmKey] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate a random 6-character uppercase key
  const generateKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed lookalike chars like O, I, 1, 0
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedKey(result);
  };

  useEffect(() => {
    if (isOpen) {
      generateKey();
      setConfirmKey("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!user || confirmKey !== generatedKey) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(user.id);
      showToast(`${user.name} has been permanently removed.`, "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to delete user.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Danger Header */}
        <div className="p-6 text-center border-b border-slate-50">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Confirm Deletion</h2>
          <p className="text-xs text-slate-500 mt-1 px-4">
            You are about to delete{" "}
            <span className="font-bold text-slate-800">{user.name}</span>. This
            action is permanent and cannot be undone.
          </p>
        </div>

        {/* Security Challenge */}
        <div className="p-6 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Security Challenge
            </label>
            <button
              onClick={generateKey}
              className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> New Key
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            {generatedKey.split("").map((char, i) => (
              <span
                key={i}
                className="w-9 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-700 shadow-sm"
              >
                {char}
              </span>
            ))}
          </div>

          <input
            type="text"
            placeholder="Enter the key above"
            value={confirmKey}
            onChange={(e) => setConfirmKey(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 text-center font-mono text-sm font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmKey !== generatedKey || isDeleting}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95",
              confirmKey === generatedKey
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : "bg-slate-300 cursor-not-allowed shadow-none",
            )}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" /> Delete User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
