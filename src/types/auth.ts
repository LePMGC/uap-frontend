export type UserRole = string;

export interface User {
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  permissions?: string[];
}

export const PERM = {
  // Roles & Permissions
  VIEW_ROLES: "view_roles",
  CREATE_ROLES: "create_roles",
  EDIT_ROLES: "edit_roles",
  DELETE_ROLES: "delete_roles",
  ASSIGN_PERMISSIONS: "assign_permissions",

  // Users
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",
  RESET_USER_PASSWORDS: "reset_user_passwords",

  // Providers & Categories
  VIEW_PROVIDERS: "view_providers",
  CREATE_PROVIDERS: "create_providers",
  EDIT_PROVIDERS: "edit_providers",
  DELETE_PROVIDERS: "delete_providers",
  TEST_CONNECTIVITY: "test_connectivity",
  VIEW_PROVIDER_CATEGORIES: "view_provider_categories",

  // Instances
  VIEW_INSTANCES: "view_instances",
  CREATE_INSTANCES: "create_instances",
  EDIT_INSTANCES: "edit_instances",
  DELETE_INSTANCES: "delete_instances",
  PING_INSTANCES: "ping_instances",
  GET_INSTANCE_COMMANDS: "get_instance_commands",

  // Database-driven Command Management
  VIEW_ALL_COMMANDS: "view_all_commands",
  VIEW_OWN_COMMANDS: "view_own_commands",
  MANAGE_ALL_COMMANDS: "manage_all_commands",
  MANAGE_OWN_COMMANDS: "manage_own_commands",
  VIEW_COMMAND_BLUEPRINTS: "view_command_blueprints",

  // Datasources
  VIEW_DATASOURCES: "view_datasources",
  CREATE_DATASOURCES: "create_datasources",
  EDIT_DATASOURCES: "edit_datasources",
  DELETE_DATASOURCES: "delete_datasources",
  TEST_DATASOURCES: "test_datasources",

  // Reimbursements
  APPROVE_TIER3_REIMBURSEMENTS: "approve_tier3_reimbursements",
  APPROVE_TIER2_REIMBURSEMENTS: "approve_tier2_reimbursements",
  APPROVE_TIER1_REIMBURSEMENTS: "approve_tier1_reimbursements",
  CREATE_SINGLE_REIMBURSEMENTS: "create_single_reimbursement",
  CREATE_BULK_REIMBURSEMENTS: "create_bulk_reimbursements",
  VIEW_ALL_REIMBURSEMENTS: "view_all_reimbursements",
  VIEW_OWN_REIMBURSEMENTS: "view_own_reimbursements",
  MANAGE_REIMBURSEMENT_SETTINGS: "manage_reimbursement_settings",
  CANCEL_REIMBURSEMENTS: "cancel_reimbursements",

  // PROVISIONING PROFILES
  VIEW_PROVISIONING_PROFILES: "view_provisioning_profiles",
  CREATE_PROVISIONING_PROFILES: "create_provisioning_profiles",
  EDIT_PROVISIONING_PROFILES: "edit_provisioning_profiles",
  DELETE_PROVISIONING_PROFILES: "delete_provisioning_profiles",
  RETRY_FAILED_PROVISIONING: "retry_failed_provisioning",

  //FUNDING ACCOUNTS
  VIEW_FUNDING_ACCOUNTS: "view_funding_accounts",
  CREATE_FUNDING_ACCOUNTS: "create_funding_accounts",
  EDIT_FUNDING_ACCOUNTS: "edit_funding_accounts",
  DELETE_FUNDING_ACCOUNTS: "delete_funding_accounts",

  // Commands
  EXECUTE_COMMANDS: "execute_commands",
  EXECUTE_ALL_COMMANDS: "execute_all_commands",
  VIEW_ALL_COMMAND_LOGS: "view_all_command_logs",
  VIEW_OWN_COMMAND_LOGS: "view_own_command_logs",

  // Batch Templates
  VIEW_ALL_BATCH_TEMPLATES: "view_all_batch_templates",
  VIEW_OWN_BATCH_TEMPLATES: "view_own_batch_templates",
  CREATE_BATCH_TEMPLATES: "create_batch_templates",
  EDIT_BATCH_TEMPLATES: "edit_batch_templates",
  DELETE_BATCH_TEMPLATES: "delete_batch_templates",
  MANAGE_ALL_BATCH_TEMPLATES: "manage_all_batch_templates",
  MANAGE_OWN_BATCH_TEMPLATES: "manage_own_batch_templates",
  DISCOVER_BATCH_HEADERS: "discover_batch_headers",

  // Batch Instances
  RUN_BATCH_JOBS: "run_batch_jobs",
  VIEW_ALL_BATCH_INSTANCES: "view_all_batch_instances",
  VIEW_OWN_BATCH_INSTANCES: "view_own_batch_instances",
  CANCEL_BATCH_INSTANCES: "cancel_batch_instances",
  DOWNLOAD_BATCH_RESULTS: "download_batch_results",
  DOWNLOAD_BATCH_REPORT: "download_batch_report",

  // Scheduling
  MANAGE_BATCH_SCHEDULES: "manage_batch_schedules",
  MANAGE_OWN_BATCH_SCHEDULES: "manage_own_batch_schedules",

  // Audit
  VIEW_AUDIT_LOGS: "view_audit_logs",
  VIEW_SECURITY_LOGS: "view_security_logs",
  VIEW_TRACE_TIMELINE: "view_trace_timeline",
  VIEW_CONNECTIVITY_STATS: "view_connectivity_stats",
  EXPORT_AUDIT_LOGS: "export_audit_logs",

  // Ericsson UCIP
  ERICSSON_UCIP: {
    VIEW: "ericsson-ucip.view",
    CREATE: "ericsson-ucip.create",
    UPDATE: "ericsson-ucip.update",
    DELETE: "ericsson-ucip.delete",
    RUN: "ericsson-ucip.run",
    GET: "ericsson-ucip.get",
    SET: "ericsson-ucip.set",
  },

  // Ericsson CAI
  ERICSSON_CAI: {
    VIEW: "ericsson-cai.view",
    CREATE: "ericsson-cai.create",
    UPDATE: "ericsson-cai.update",
    DELETE: "ericsson-cai.delete",
    RUN: "ericsson-cai.run",
    GET: "ericsson-cai.get",
    SET: "ericsson-cai.set",
  },

  // SMPP
  SMPP: {
    VIEW: "smpp.view",
    CREATE: "smpp.create",
    UPDATE: "smpp.update",
    DELETE: "smpp.delete",
    RUN: "smpp.run",
    GET: "smpp.get",
    SET: "smpp.set",
  },
} as const;

/**
 * Recursively extracts only the leaf string values from a nested object.
 */
type LeafValues<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? LeafValues<T[keyof T]>
    : never;

/**
 * Union of every permission string in PERM.
 *
 * Examples:
 * - "view_users"
 * - "view_roles"
 * - "execute_commands"
 * - "ericsson-ucip.view"
 * - "smpp.run"
 */
export type PermissionType = LeafValues<typeof PERM>;
