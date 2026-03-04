export interface Permission {
  id: number;
  name: string;
  label: string;
  group: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  users_count?: number;
  permissions?: Permission[];
  created_at?: string;
}

export interface RoleUpdatePayload {
  name: string;
  permissions: number[];
}
