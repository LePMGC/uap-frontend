import api from "@/lib/api";
import type { User } from "@/types/users";

// types/api.ts (or inside userService.ts)
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number;
  to: number;
  total: number;
  last_page: number;
  per_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export interface UserFilters {
  name?: string;
  role?: string;
  status?: "active" | "blocked";
  per_page?: number;
  search?: string;
}

export interface CreateUserPayload {
  username: string;
  name: string;
  email: string;
  phone_number: string;
  role_id: number;
}

export const userService = {
  getAllUsers: async (
    page: number = 1,
    perPage: number = 15,
    filters?: UserFilters,
  ): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get(`/management/users`, {
        params: {
          page,
          per_page: perPage,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("UserService.getAllUsers failed:", error);
      throw error;
    }
  },

  createUser: async (userData: CreateUserPayload): Promise<User> => {
    try {
      const response = await api.post(`/management/users`, userData);
      return response.data;
    } catch (error) {
      console.error("UserService.createUser failed:", error);
      throw error;
    }
  },

  updateUser: async (
    userId: number,
    userData: Partial<CreateUserPayload>,
  ): Promise<User> => {
    try {
      const response = await api.put(`/management/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error("UserService.updateUser failed:", error);
      throw error;
    }
  },

  blockUser: async (userId: number) => {
    try {
      const response = await api.patch(`/management/users/${userId}/block`);
      return response.data;
    } catch (error) {
      console.error("UserService.blockUser failed:", error);
      throw error;
    }
  },

  unblockUser: async (userId: number) => {
    try {
      const response = await api.patch(`/management/users/${userId}/unblock`);
      return response.data;
    } catch (error) {
      console.error("UserService.unblockUser failed:", error);
      throw error;
    }
  },

  deleteUser: async (userId: number) => {
    try {
      const response = await api.delete(`/management/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("UserService.deleteUser failed:", error);
      throw error;
    }
  },

  resetPassword: async (userId: number) => {
    const response = await api.post(
      `/management/users/${userId}/reset-password`,
    );
    return response.data; // Should return { status, message, temporary_password }
  },
};
