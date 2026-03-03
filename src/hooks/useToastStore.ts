import { create } from "zustand";

type ToastType = "success" | "error";

interface ToastState {
  message: string | null;
  type: ToastType;
  isVisible: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "success",
  isVisible: false,
  showToast: (message, type = "success") => {
    set({ message, type, isVisible: true });
    // Auto-hide after 4 seconds
    setTimeout(() => set({ isVisible: false }), 4000);
  },
  hideToast: () => set({ isVisible: false }),
}));
