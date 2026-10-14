import type { Metadata } from 'next';
import { ProjectsBlock } from '@/components/public/ProjectsBlock';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReBuyingProcessCompact, ReEnquireCtaBar, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { apiGet } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Projects | JK Balaji Real Estate',
  description: 'Published JK Balaji real estate developments and JK Nagar phases in Tamil Nadu.',
  alternates: { canonical: 'https://jkbalaji.in/projects' },
};

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
        title="Our Projects"
        description="Published layouts from our catalogue. Availability and pricing are confirmed when you enquire."
      />
      <ProjectsBlock projects={projects} />
      <ReBuyingProcessCompact />
      <ReEnquireCtaBar title="Book a site visit" detail="Tell us which project interests you — we schedule visits after confirming availability." />
    </RealEstatePageShell>
  );
}
