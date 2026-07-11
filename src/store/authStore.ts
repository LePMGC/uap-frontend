import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode"; // Import the decoder
import type { User } from "@/types/auth";
// 1. Import the tab store to clear workspace states upon session termination
import { useTabStore } from "@/store/tabStore";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  needsPasswordChange: boolean;
  setAuth: (
    user: any,
    accessToken: string,
    refreshToken: string,
    needsChange: boolean,
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      needsPasswordChange: false,

      setAuth: (user, accessToken, refreshToken, needsChange) => {
        try {
          const decoded = jwtDecode<any>(accessToken);

          // Check your console after login to see this log!
          console.log("Decoded JWT Payload:", decoded);

          const fullUser: User = {
            ...user,
            // Ensure key names match exactly what you saw in jwt.io
            username: decoded.username || user.username,
            role:
              decoded.role ||
              (Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles),
            permissions: decoded.permissions || [],
          };

          set({
            user: fullUser,
            accessToken,
            refreshToken,
            needsPasswordChange: needsChange,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("JWT Decode Error:", error);
        }
      },

      logout: () => {
        // 2. Clear the global tab layout state to close all open workspace view frames
        if (typeof useTabStore.getState().resetTabs === "function") {
          useTabStore.getState().resetTabs();
        } else {
          // Fallback safe patch in case resetTabs isn't fully written in tabStore yet
          useTabStore.setState({
            tabs: [{ id: "dashboard", title: "Dashboard", url: "/dashboard" }],
            activeTabId: "dashboard",
          });
        }

        // 3. Reset the primary user authentication indicators
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          needsPasswordChange: false,
        });
      },
    }),
    { name: "uap-auth-storage" },
  ),
);
