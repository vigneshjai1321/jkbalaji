import Link from 'next/link';
import { SiteImage } from '@/components/site/SiteImage';

type Project = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: string;
  phaseLabel?: string | null;
  description: string | null;
  coverImage?: string | null;
};

const phaseLabel: Record<string, string> = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  UPCOMING: 'Upcoming',
  ALMOST_COMPLETED: 'Almost Completed',
  YET_TO_BE_ANNOUNCED: 'Yet to Be Announced',
};

function enquireHref(project: Project) {
  if (project.slug === 'jk-nagar-phase-1') return '/jk-nagar/phase-1';
  if (project.slug === 'jk-nagar-phase-2') return '/jk-nagar/phase-2';
  if (project.slug === 'jk-nagar-phase-3') return '/jk-nagar/phase-3';
  return `/contact?project=${encodeURIComponent(project.slug)}`;
}

export function ProjectsBlock({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="re-section bg-slate-100 border-y border-slate-200/60">
      <div className="re-container">
        <p className="re-eyebrow reveal">Developments</p>
        <h2 className="re-heading mt-2 reveal">Our Projects</h2>
        <p className="re-subheading mt-2 reveal max-w-2xl">Published developments. Availability is confirmed with our team — unpublished drafts are not listed here.</p>
        {projects.length === 0 ? (
          <p className="mt-8 text-slate-600 reveal">Project listings are updated from our admin panel — contact us for the latest availability.</p>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const status = phaseLabel[project.phase] ?? project.phase;
              const interestOnly = project.phase === 'YET_TO_BE_ANNOUNCED';
              return (
                <article key={project.id} className="reveal flex flex-col rounded-2xl bg-white border border-emerald-100 overflow-hidden shadow-sm">
                  {project.coverImage ? (
                    <div className="relative h-40 w-full bg-slate-100">
                      <SiteImage
                        src={project.coverImage}
                        alt={`${project.name} project`}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-semibold tracking-wide text-emerald-700">{status}</span>
                    <h3 className="mt-2 font-bold text-lg">{project.name}</h3>
                    {project.phaseLabel ? <p className="text-sm text-slate-500 mt-1">{project.phaseLabel}</p> : null}
                    {project.location ? <p className="text-sm text-slate-600 mt-1">{project.location}</p> : null}
                    {project.description ? <p className="text-sm text-slate-700 mt-3 line-clamp-4">{project.description}</p> : null}
                    <Link href={enquireHref(project)} className="mt-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline">
                      {interestOnly ? 'Register Interest' : 'Enquire About This Project'}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
