import React from "react";
import { useAuthStore } from "@/store/authStore";
import type { PermissionType } from "@/types/auth";

interface HasPermissionProps {
  children: React.ReactNode;

  // one permission
  permission?: PermissionType | null;
  requiredPermission?: PermissionType | null;

  // OR any of these
  permissions?: PermissionType[];
}

export function HasPermission({
  children,
  permission,
  requiredPermission,
  permissions,
}: HasPermissionProps) {
  const userPermissions = useAuthStore(
    (state) => state.user?.permissions ?? [],
  );

  if (permissions?.length) {
    return permissions.some((p) => userPermissions.includes(p)) ? (
      <>{children}</>
    ) : null;
  }

  const singlePermission = requiredPermission ?? permission;

  if (!singlePermission) {
    return <>{children}</>;
  }

  return userPermissions.includes(singlePermission) ? <>{children}</> : null;
}
