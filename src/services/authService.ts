import api from "@/lib/api";
import type { User } from "@/types/users";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  must_change_password: boolean;
  auth_mode: string;
  user: User;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/login", { username, password });
    return response.data;
  },

  changePassword: async (
    current_password: string,
    new_password: string,
    new_password_confirmation: string,
  ) => {
    const response = await api.post("/auth/change-password", {
      current_password,
      new_password,
      new_password_confirmation,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
