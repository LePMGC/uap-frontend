export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  is_blocked: boolean;
  role: string;
  role_id: number;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  created_at: string;
}
