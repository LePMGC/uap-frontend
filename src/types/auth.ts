export type UserRole = string; // Backend-driven role names

export const PERM = {
  // Roles & Users
  VIEW_ROLES: "view_roles",
  CREATE_ROLES: "create_roles",
  EDIT_ROLES: "edit_roles",
  DELETE_ROLES: "delete_roles",
  ASSIGN_PERMISSIONS: "assign_permissions",
  MANAGE_USERS: "manage_users",

  // Providers
  VIEW_PROVIDERS: "view_providers",
  CREATE_PROVIDERS: "create_providers",
  EDIT_PROVIDERS: "edit_providers",
  DELETE_PROVIDERS: "delete_providers",
  TEST_CONNECTIVITY: "test_connectivity",

  // Datasources
  VIEW_DATASOURCES: "view_datasources",
  CREATE_DATASOURCES: "create_datasources",
  EDIT_DATASOURCES: "edit_datasources",
  DELETE_DATASOURCES: "delete_datasources",
  TEST_DATASOURCES: "test_datasources",

  // Instances & Commands
  VIEW_INSTANCES: "view_instances",
  CREATE_INSTANCES: "create_instances",
  EDIT_INSTANCES: "edit_instances",
  DELETE_INSTANCES: "delete_instances",
  PING_INSTANCES: "ping_instances",
  GET_INSTANCE_COMMANDS: "get_instance_commands",
  EXECUTE_COMMANDS: "execute_commands",
  VIEW_ALL_COMMAND_LOGS: "view_all_command_logs",
  VIEW_OWN_COMMAND_LOGS: "view_own_command_logs",
  EXECUTE_ALL_COMMANDS: "execute_all_commands",

  // Specific Providers (Ericsson)
  ERICSSON_UCIP: {
    VIEW: "ericsson-ucip.view",
    CREATE: "ericsson-ucip.create",
    UPDATE: "ericsson-ucip.update",
    DELETE: "ericsson-ucip.delete",
    RUN: "ericsson-ucip.run",
  },
  ERICSSON_CAI: {
    VIEW: "ericsson-cai.view",
    CREATE: "ericsson-cai.create",
    UPDATE: "ericsson-cai.update",
    DELETE: "ericsson-cai.delete",
    RUN: "ericsson-cai.run",
  },

  // Batch Operations
  VIEW_BATCH_TEMPLATES: "view_batch_templates",
  CREATE_BATCH_TEMPLATES: "create_batch_templates",
  EDIT_BATCH_TEMPLATES: "edit_batch_templates",
  DELETE_BATCH_TEMPLATES: "delete_batch_templates",
  DISCOVER_BATCH_HEADERS: "discover_batch_headers",
  RUN_BATCH_JOBS: "run_batch_jobs",
  VIEW_BATCH_INSTANCES: "view_batch_instances",
  CANCEL_BATCH_INSTANCES: "cancel_batch_instances",
  DOWNLOAD_BATCH_RESULTS: "download_batch_results",
  MANAGE_BATCH_SCHEDULES: "manage_batch_schedules",
  DOWNLOAD_BATCH_REPORT: "download_batch_report",
} as const;
