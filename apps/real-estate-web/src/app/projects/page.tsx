import { ProjectsBlock } from '@/components/public/ProjectsBlock';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReBuyingProcessCompact, ReEnquireCtaBar, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { apiGet } from '@/lib/api';

export const metadata = reStaticMetadata('projects');

type Project = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: 'ONGOING' | 'COMPLETED' | 'UPCOMING';
  description: string | null;
};

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    projects = await apiGet<Project[]>('/public/projects');
  } catch {
    projects = [];
  }

  return (
    <RealEstatePageShell>
      <RePageHeader
        eyebrow="Developments"
        title="Our Developments & Real Estate Services"
        description="Explore JK Nagar phases, services, and published layouts. Availability and pricing are confirmed when you enquire."
      />
      <ProjectsBlock projects={projects} showPageHeader={false} />
      <ReBuyingProcessCompact />
      <ReEnquireCtaBar title="Book a site visit" detail="Tell us which project interests you — we schedule visits after confirming availability." />
    </RealEstatePageShell>
  );
}
