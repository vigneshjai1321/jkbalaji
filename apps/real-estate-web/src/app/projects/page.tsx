import type { Metadata } from 'next';
import { ProjectsBlock } from '@/components/public/ProjectsBlock';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
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
      <div className="re-container py-10 md:py-14">
        <p className="re-eyebrow">Developments</p>
        <h1 className="re-heading mt-2">Our Projects</h1>
        <p className="re-subheading mt-3 max-w-2xl">
          Published layouts from our admin catalogue. Availability and pricing are confirmed when you enquire — we do not list
          speculative launches.
        </p>
      </div>
      <ProjectsBlock projects={projects} />
    </RealEstatePageShell>
  );
}
