// /var/www/html/uap-frontend/src/components/navigation/Sidebar.tsx
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
  ListFilter,
  ReceiptEuro,
  Globe,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { HasPermission } from "@/components/auth/HasPermission";
import { PERM } from "@/types/auth";
import { useTabStore } from "@/store/tabStore";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

const getFeatureKey = (path: string) =>
  path.replace(/^\/+|\/+$/g, "").split("/")[0];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const addTab = useTabStore((state) => state.addTab);
  const { t, i18n } = useTranslation();

  const menuGroups = [
    {
      key: "OPERATIONS",
      label: t("sidebar.groups.OPERATIONS"),
      requiredPermissions: [
        PERM.VIEW_INSTANCES,
        PERM.VIEW_OWN_COMMAND_LOGS,
        PERM.VIEW_ALL_COMMAND_LOGS,
        PERM.VIEW_OWN_BATCH_TEMPLATES,
        PERM.VIEW_ALL_BATCH_TEMPLATES,
        PERM.VIEW_OWN_BATCH_INSTANCES,
        PERM.VIEW_ALL_BATCH_INSTANCES,
        PERM.VIEW_TRACE_TIMELINE,
        PERM.VIEW_ALL_REIMBURSEMENTS,
        PERM.VIEW_OWN_REIMBURSEMENTS,
      ],
      items: [
        {
          name: t("sidebar.nav.dashboard"),
          icon: LayoutDashboard,
          url: "/dashboard",
          requiredPermission: PERM.VIEW_INSTANCES,
        },
        {
          name: t("sidebar.nav.reimbursements"),
          icon: ReceiptEuro,
          url: "/reimbursements",
          requiredPermission:
            PERM.VIEW_OWN_REIMBURSEMENTS || PERM.VIEW_ALL_REIMBURSEMENTS,
        },
        {
          name: t("sidebar.nav.singleExecution"),
          icon: PlayCircle,
          url: "/single-execution",
          requiredPermission: PERM.EXECUTE_COMMANDS,
        },
        {
          name: t("sidebar.nav.commandLogs"),
          icon: ListFilter,
          url: "/commands-logs",
          requiredPermission: PERM.VIEW_OWN_COMMAND_LOGS,
        },
        {
          name: t("sidebar.nav.batchJobs"),
          icon: Layers,
          url: "/batch-jobs",
          requiredPermission: PERM.VIEW_OWN_BATCH_INSTANCES,
        },
        {
          name: t("sidebar.nav.logs"),
          icon: Activity,
          url: "/logs",
          requiredPermission: PERM.VIEW_TRACE_TIMELINE,
        },
      ],
    },
    {
      key: "MANAGEMENT",
      label: t("sidebar.groups.MANAGEMENT"),
      requiredPermissions: [
        PERM.VIEW_PROVIDERS,
        PERM.VIEW_DATASOURCES,
        PERM.VIEW_ALL_COMMANDS,
        PERM.VIEW_OWN_COMMANDS,
        PERM.VIEW_COMMAND_BLUEPRINTS,
        PERM.VIEW_PROVISIONING_PROFILES,
        PERM.VIEW_FUNDING_ACCOUNTS,
      ],
      items: [
        {
          name: t("sidebar.nav.providers"),
          icon: Server,
          url: "/providers-instances",
          requiredPermission: PERM.VIEW_PROVIDERS,
        },
        {
          name: t("sidebar.nav.dataSources"),
          icon: Database,
          url: "/data-sources",
          requiredPermission: PERM.VIEW_DATASOURCES,
        },
        {
          name: t("sidebar.nav.commandDefs"),
          icon: Code2,
          url: "/commands-definitions",
          requiredPermission: PERM.VIEW_OWN_COMMANDS,
        },
        {
          name: t("sidebar.nav.provisioningProfiles"),
          icon: Layers,
          url: "/provisioning-profiles",
          requiredPermission: PERM.VIEW_PROVISIONING_PROFILES,
        },
        {
          name: t("sidebar.nav.fundingAccounts"),
          icon: Server,
          url: "/funding-accounts",
          requiredPermission: PERM.VIEW_FUNDING_ACCOUNTS,
        },
      ],
    },
    {
      key: "GOVERNANCE",
      label: t("sidebar.groups.GOVERNANCE"),
      requiredPermissions: [
        PERM.VIEW_USERS,
        PERM.VIEW_ROLES,
        PERM.VIEW_AUDIT_LOGS,
      ],
      items: [
        {
          name: t("sidebar.nav.usersManagement"),
          icon: Users,
          url: "/users",
          requiredPermission: PERM.VIEW_USERS,
        },
        {
          name: t("sidebar.nav.rolesPermissions"),
          icon: UserCircle,
          url: "/roles",
          requiredPermission: PERM.VIEW_ROLES,
        },
        {
          name: t("sidebar.nav.auditLogs"),
          icon: ShieldCheck,
          url: "/audit-logs",
          requiredPermission: PERM.VIEW_AUDIT_LOGS,
        },
      ],
    },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen border-r border-slate-200 bg-white flex flex-col fixed left-0 top-0 z-20">
      {brandHeader}

      {/* Navigation with Permission Guards */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group) => (
          <HasPermission
            key={group.key}
            permissions={group.requiredPermissions}
          >
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    getFeatureKey(location.pathname) ===
                    getFeatureKey(item.url);

                  return (
                    <HasPermission
                      key={item.url}
                      permission={item.requiredPermission}
                    >
                      <Link
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
                    </HasPermission>
                  );
                })}
              </div>
            </div>
          </HasPermission>
        ))}
      </nav>

      {/* Bottom Profile, Language Switcher, and Build Info Section */}
      <div className="mt-auto">
        {/* Language Picker */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Globe className="h-3.5 w-3.5 text-indigo-500" />
            <span>{t("sidebar.language")}</span>
          </div>

          <select
            value={i18n.language?.split("-")[0] || "en"}
            onChange={handleLanguageChange}
            className="text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer shadow-sm transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">
              {user?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "UA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.name || t("sidebar.defaultUser")}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {user?.role || t("sidebar.defaultRole")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <UserCircle className="h-3.5 w-3.5" />
              {t("sidebar.profile")}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-2 rounded-lg border border-red-100 bg-white text-red-600 text-[11px] font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("sidebar.logout")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

const brandHeader = (
  <div className="p-6 flex items-center gap-3">
    <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center shadow-sm">
      <span className="text-white font-bold text-sm">UA</span>
    </div>
    <span className="font-bold text-slate-800 tracking-tight text-lg">
      Platform
    </span>
  </div>
);
