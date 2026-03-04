import {
  LayoutDashboard,
  PlayCircle,
  Layers,
  Activity,
  Server,
  Code2,
  Database,
  Users,
  ShieldCheck,
  UserCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Added Link and useLocation
import { HasPermission } from "@/components/auth/HasPermission";
import { PERM } from "@/types/auth";
import { useTabStore } from "@/store/tabStore";

// Mapping menu groups to their required permissions
const menuGroups = [
  {
    label: "OPERATIONS",
    requiredPermission:
      PERM.VIEW_INSTANCES ||
      PERM.VIEW_OWN_COMMAND_LOGS ||
      PERM.VIEW_BATCH_TEMPLATES ||
      PERM.VIEW_BATCH_INSTANCES,
    items: [
      { name: "Dashboard", icon: LayoutDashboard, url: "/dashboard" }, // Added URLs
      { name: "Single Execution", icon: PlayCircle, url: "/execution" },
      { name: "Batch Jobs", icon: Layers, url: "/batches" },
      { name: "Monitoring", icon: Activity, url: "/monitoring" },
    ],
  },
  {
    label: "MANAGEMENT",
    requiredPermission:
      PERM.VIEW_PROVIDERS ||
      PERM.VIEW_DATASOURCES ||
      PERM.VIEW_ALL_COMMAND_LOGS,
    items: [
      { name: "Providers", icon: Server, url: "/providers" },
      { name: "Data Sources", icon: Database, url: "/sources" },
      { name: "Command Defs", icon: Code2, url: "/commands" },
    ],
  },
  {
    label: "GOVERNANCE",
    requiredPermission: PERM.MANAGE_USERS || PERM.VIEW_ROLES,
    items: [
      { name: "Users Management", icon: Users, url: "/users" },
      { name: "Roles & Permissions", icon: UserCircle, url: "/roles" },
      { name: "Audit Logs", icon: ShieldCheck, url: "/audit" },
    ],
  },
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const addTab = useTabStore((state) => state.addTab);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen border-r border-slate-200 bg-white flex flex-col fixed left-0 top-0 z-20">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">UA</span>
        </div>
        <span className="font-bold text-slate-800 tracking-tight text-lg">
          Platform
        </span>
      </div>

      {/* Navigation with Permission Guards */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group) => (
          <HasPermission
            key={group.label}
            permission={group.requiredPermission}
          >
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  // Determine active state based on the current URL
                  const isActive = location.pathname === item.url;

                  return (
                    <Link
                      key={item.name}
                      to={item.url}
                      onClick={() =>
                        addTab({
                          id: item.url,
                          title: item.name,
                          url: item.url,
                          icon: item.icon,
                        })
                      }
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive
                              ? "text-blue-600"
                              : "text-slate-400 group-hover:text-slate-600",
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-blue-400 animate-in slide-in-from-left-1" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </HasPermission>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/40">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">
            {user?.name
              ?.split(" ")
              .map((n: string) => n[0]) // Fixed mapping type
              .join("") || "UA"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.name || "Operations User"}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {user?.role || "Administrator"}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm active:scale-95"
          >
            <UserCircle className="h-3.5 w-3.5" />
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-red-100 bg-white text-red-600 text-[11px] font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
