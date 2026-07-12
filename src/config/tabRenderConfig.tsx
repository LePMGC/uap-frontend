// src/config/tabRenderConfig.tsx
import React, { lazy, Suspense } from "react";

// Lazy Imports
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const RolesPage = lazy(() => import("@/pages/roles/RolesPage"));
const RoleFormPage = lazy(() => import("@/pages/roles/RoleFormPage"));
const DataSourcesPage = lazy(
  () => import("@/pages/data_sources/DataSourcesPage"),
);
const DataSourceFormPage = lazy(
  () => import("@/pages/data_sources/DataSourceFormPage"),
);
const ProviderInstancesPage = lazy(
  () => import("@/pages/provider_instances/ProviderInstancesPage"),
);
const ProviderInstanceFormPage = lazy(
  () => import("@/pages/provider_instances/ProviderInstanceFormPage"),
);
const AuditLogsPage = lazy(() => import("@/pages/audit/AuditLogsPage"));
const CommandDefinitionsPage = lazy(
  () => import("@/pages/commands_definitions/CommandDefinitionsPage"),
);
const CommandFormPage = lazy(
  () => import("@/pages/commands_definitions/CommandFormPage"),
);
const CommandExecutionPage = lazy(
  () => import("@/pages/commands_executions/CommandExecutionPage"),
);
const CommandLogsPage = lazy(
  () => import("@/pages/commands_logs/CommandLogsPage"),
);
const BatchJobsPage = lazy(() => import("@/pages/batch_jobs/BatchJobsPage"));
const CreateBatchJobPage = lazy(() => import("@/pages/batch_jobs/wizard"));
const BatchJobDetailsPage = lazy(
  () => import("@/pages/batch_jobs/BatchJobDetailsPage"),
);
const LeapJourneyPage = lazy(() => import("@/pages/leap_logs"));
const ReimbursementsPage = lazy(
  () => import("@/pages/reimbursements/ReimbursementsPage"),
);
const CreateReimbursementPage = lazy(
  () => import("@/pages/reimbursements/CreateReimbursementPage"),
);
const ReimbursementDetailsPage = lazy(
  () => import("@/pages/reimbursements/ReimbursementDetailsPage"),
);
const FundingAccountsPage = lazy(
  () => import("@/pages/funding-accounts/FundingAccountsPage"),
);
const CreateFundingAccountPage = lazy(
  () => import("@/pages/funding-accounts/CreateFundingAccountPage"),
);
const FundingAccountDetailsPage = lazy(
  () => import("@/pages/funding-accounts/FundingAccountDetailsPage"),
);
const ProvisioningProfilesPage = lazy(
  () => import("@/pages/provisioning-profiles/ProvisioningProfilesPage"),
);
const CreateProvisioningProfilePage = lazy(
  () => import("@/pages/provisioning-profiles/CreateProvisioningProfilePage"),
);
const ProvisioningProfileDetailsPage = lazy(
  () => import("@/pages/provisioning-profiles/ProvisioningProfileDetailsPage"),
);

export function renderTabContent(
  tabId: string,
  currentUrl: string,
): React.ReactNode {
  // Normalize both parameters by dropping any trailing or leading slashes completely
  const cleanTabId = tabId.replace(/^\/+|\/+$/g, "");
  const urlPath = (currentUrl || tabId).replace(/^\/+|\/+$/g, "");

  // Breakdown the URL parts (e.g., "reimbursements/create" -> ["reimbursements", "create"])
  const parts = urlPath.split("/");

  let Component: React.ComponentType<any> | null = null;
  let componentProps: any = {};

  switch (cleanTabId) {
    case "dashboard":
      Component = Dashboard;
      break;
    case "users":
      Component = UsersPage;
      break;
    case "audit-logs":
      Component = AuditLogsPage;
      break;
    case "single-execution":
      Component = CommandExecutionPage;
      break;
    case "commands-logs":
      Component = CommandLogsPage;
      break;
    case "logs":
      Component = LeapJourneyPage;
      break;

    case "roles":
      if (parts[1] === "create") Component = RoleFormPage;
      else if (parts[1]) {
        Component = RoleFormPage;
        componentProps = { id: parts[1] };
      } else Component = RolesPage;
      break;

    case "data-sources":
      if (parts[1] === "create") Component = DataSourceFormPage;
      else if (parts[1]) {
        Component = DataSourceFormPage;
        componentProps = { id: parts[1] };
      } else Component = DataSourcesPage;
      break;

    case "providers-instances":
      if (parts[1] === "create") Component = ProviderInstanceFormPage;
      else if (parts[1]) {
        Component = ProviderInstanceFormPage;
        componentProps = { id: parts[1] };
      } else Component = ProviderInstancesPage;
      break;

    case "commands-definitions":
      if (parts[1] === "create") Component = CommandFormPage;
      else if (parts[1]) {
        Component = CommandFormPage;
        componentProps = { id: parts[1] };
      } else Component = CommandDefinitionsPage;
      break;

    case "batch-jobs":
      if (parts[1] === "create") Component = CreateBatchJobPage;
      else if (parts[1]) {
        Component = BatchJobDetailsPage;
        componentProps = { id: parts[1] };
      } else Component = BatchJobsPage;
      break;

    case "reimbursements":
      if (parts[1] === "create") Component = CreateReimbursementPage;
      else if (parts[1]) {
        Component = ReimbursementDetailsPage;
        componentProps = { id: parts[1] };
      } else Component = ReimbursementsPage;
      break;

    case "funding-accounts":
      if (parts[1] === "create") Component = CreateFundingAccountPage;
      else if (parts[1]) {
        Component = FundingAccountDetailsPage;
        componentProps = { id: parts[1] };
      } else Component = FundingAccountsPage;
      break;

    case "provisioning-profiles":
      if (parts[1] === "create") Component = CreateProvisioningProfilePage;
      else if (parts[1]) {
        Component = ProvisioningProfileDetailsPage;
        componentProps = { id: parts[1] };
      } else Component = ProvisioningProfilesPage;
      break;

    default:
      return (
        <div className="p-6 text-slate-500 text-sm bg-slate-50 border border-slate-200 rounded-md">
          No layout context mapped for feature key:{" "}
          <span className="font-mono font-bold text-red-600">{tabId}</span>
          <br />
          <span className="text-xs text-slate-400 mt-1 block">
            Clean feature identifier: "{cleanTabId}"
          </span>
        </div>
      );
  }

  if (!Component) return null;

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center min-h-[400px]">
          <div className="text-slate-400 text-sm font-medium flex items-center gap-2 animate-pulse">
            <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
            Loading workspace view...
          </div>
        </div>
      }
    >
      <Component {...componentProps} />
    </Suspense>
  );
}
