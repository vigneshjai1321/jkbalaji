export type AdminWorkspace = 'all' | 'real_estate' | 'jewellery';

export const WORKSPACE_LABELS: Record<AdminWorkspace, string> = {
  all: 'All Businesses',
  real_estate: 'Real Estate',
  jewellery: 'Jewellery',
};

/** Nav group titles shown per workspace (authorization remains on the API). */
export function navGroupsForWorkspace(workspace: AdminWorkspace): string[] {
  switch (workspace) {
    case 'real_estate':
      return ['Business', 'Real Estate', 'CRM', 'Finance', 'Operations', 'Administration'];
    case 'jewellery':
      return ['Business', 'Jewellery', 'CRM', 'Finance', 'Operations', 'Administration'];
    default:
      return ['Business', 'Real Estate', 'Jewellery', 'Finance', 'CRM', 'Operations', 'Administration'];
  }
}

export function workspaceStorageKey() {
  return 'jk_admin_workspace';
}
