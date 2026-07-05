import { create } from "zustand";

interface WorkspaceState {
  openTabs: string[];
  activeTab: string;
  openTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  resetWorkspace: () => void; // <--- The critical cleanup trigger
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  openTabs: ["dashboard"],
  activeTab: "dashboard",
  openTab: (tabId) =>
    set((state) => ({
      openTabs: state.openTabs.includes(tabId)
        ? state.openTabs
        : [...state.openTabs, tabId],
      activeTab: tabId,
    })),
  closeTab: (tabId) =>
    set((state) => {
      const newTabs = state.openTabs.filter((t) => t !== tabId);
      return {
        openTabs: newTabs.length ? newTabs : ["dashboard"],
        activeTab:
          state.activeTab === tabId
            ? newTabs[newTabs.length - 1] || "dashboard"
            : state.activeTab,
      };
    }),
  resetWorkspace: () =>
    set({ openTabs: ["dashboard"], activeTab: "dashboard" }), // Reset state completely
}));
