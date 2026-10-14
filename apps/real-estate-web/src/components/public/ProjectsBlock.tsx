import { DevelopmentsSection, type ApiProject } from '@/components/realestate/developments/DevelopmentsSection';

export type { ApiProject as Project };

export function ProjectsBlock({
  projects,
  showPageHeader = true,
}: {
  projects: ApiProject[];
  showPageHeader?: boolean;
}) {
  return <DevelopmentsSection projects={projects} showPageHeader={showPageHeader} />;
}
