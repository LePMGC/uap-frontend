import { useAuthStore } from "@/store/authStore";

interface HasPermissionProps {
  permission: string;
  children: React.ReactNode;
}

export function HasPermission({ permission, children }: HasPermissionProps) {
  const user = useAuthStore((state) => state.user);
  const hasAccess = user?.permissions?.includes(permission);

  // If this logs "Access Denied", we know it's a string mismatch
  if (!hasAccess) {
    console.warn(`Access Denied for: ${permission}`);
    return null;
  }

  return <>{children}</>;
}
