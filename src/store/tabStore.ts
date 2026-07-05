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
  removeTab: (id: string) => Tab | null;
  setActiveTab: (id: string) => void;
  resetTabs: () => void;

  closingTabId: string | null;
  clearClosingTab: () => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/dashboard",
    },
  ],

  activeTabId: "dashboard",
  closingTabId: null,

  addTab: (tab) =>
    set((state) => {
      const existing = state.tabs.find((t) => t.id === tab.id);

      if (existing) {
        return { activeTabId: existing.id };
      }

      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
      };
    }),

  removeTab: (id) => {
    const state = get();

    if (id === "dashboard") return null;

    const index = state.tabs.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const remaining = state.tabs.filter((t) => t.id !== id);

    const nextActive =
      state.activeTabId === id
        ? (remaining[index - 1] ??
          remaining[index] ??
          remaining[remaining.length - 1] ??
          remaining[0] ??
          null)
        : (state.tabs.find((t) => t.id === state.activeTabId) ?? null);

    set({
      tabs: remaining,
      closingTabId: id,
      activeTabId:
        state.activeTabId === id
          ? (nextActive?.id ?? "dashboard")
          : state.activeTabId,
    });

    setTimeout(() => {
      set({ closingTabId: null });
    }, 0);

    return nextActive;
  },

  clearClosingTab: () => set({ closingTabId: null }),

  setActiveTab: (id) => set({ activeTabId: id }),

  resetTabs: () =>
    set({
      tabs: [
        {
          id: "dashboard",
          title: "Dashboard",
          url: "/dashboard",
        },
      ],
      activeTabId: "dashboard",
      closingTabId: null,
    }),
}));
