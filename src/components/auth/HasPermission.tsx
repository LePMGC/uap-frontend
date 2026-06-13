// /var/www/html/uap-frontend/src/components/auth/HasPermission.tsx
import React from "react";
import { useAuthStore } from "@/store/authStore";
import type { PermissionType } from "@/types/auth";

interface HasPermissionProps {
  permission?: PermissionType; // Backwards compatibility for single string checks
  permissions?: PermissionType[]; // New array-based permission configuration
  children: React.ReactNode;
}

export function HasPermission({
  permission,
  permissions,
  children,
}: HasPermissionProps) {
  // Extract user permissions safely from your Auth Store
  const userPermissions = useAuthStore(
    (state) => state.user?.permissions || [],
  );

  // 1. If an array of permissions is passed, evaluate if the user has AT LEAST ONE matching permission
  if (permissions && permissions.length > 0) {
    const hasAccess = permissions.some((perm) =>
      userPermissions.includes(perm),
    );
    return hasAccess ? <>{children}</> : null;
  }

  // 2. Fallback to fallback single string verification rule
  if (permission) {
    const hasAccess = userPermissions.includes(permission);
    return hasAccess ? <>{children}</> : null;
  }

  // If no validation configurations are supplied, hide elements securely
  return null;
}
