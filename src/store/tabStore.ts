import { create } from "zustand";

interface Tab {
  id: string;
  title: string;
  url: string;
  icon?: any;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [{ id: "dashboard", title: "Dashboard", url: "/dashboard" }], // Default tab
  activeTabId: "dashboard",
  addTab: (tab) =>
    set((state) => {
      const exists = state.tabs.find((t) => t.url === tab.url);
      if (exists) return { activeTabId: exists.id };
      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
      };
    }),
  removeTab: (id) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      // Don't close the last tab
      if (newTabs.length === 0) return state;
      return {
        tabs: newTabs,
        activeTabId:
          state.activeTabId === id
            ? newTabs[newTabs.length - 1].id
            : state.activeTabId,
      };
    }),
  setActiveTab: (id) => set({ activeTabId: id }),
}));
