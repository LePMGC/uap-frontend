import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: React.ReactNode;
  entityName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteConfirmationModalProps) {
  const [confirmKey, setConfirmKey] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const generateKey = () => {
    // Using a 4-digit numeric or alphanumeric key for simplicity
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (
      let i = 0;
      i < 4;
      i++ // Updated to 4 digits
    )
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedKey(result);
  };

  useEffect(() => {
    if (isOpen) {
      generateKey();
      setConfirmKey("");
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (confirmKey !== generatedKey) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error is handled by the parent's toast
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center border-b border-slate-50">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <div className="text-[11px] leading-relaxed text-slate-500 mt-2 px-4 italic">
            {description}
          </div>
        </div>

        <div className="p-8 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Security Key
            </label>
            <button
              onClick={generateKey}
              className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> New Key
            </button>
          </div>

          {/* Key Display in Small Squares */}
          <div className="flex justify-center gap-2 mb-6">
            {generatedKey.split("").map((char, index) => (
              <div
                key={index}
                className="w-10 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-400 shadow-sm"
              >
                {char}
              </div>
            ))}
          </div>

          <input
            type="text"
            maxLength={4}
            placeholder="Type the key above"
            value={confirmKey}
            onChange={(e) => setConfirmKey(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 text-center font-mono text-sm font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-300 uppercase"
          />
        </div>

        <div className="p-4 flex gap-3 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmKey !== generatedKey || isDeleting}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-red-100",
              confirmKey === generatedKey
                ? "bg-red-600 hover:bg-red-700 active:scale-95"
                : "bg-slate-300 cursor-not-allowed shadow-none",
            )}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" /> Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
