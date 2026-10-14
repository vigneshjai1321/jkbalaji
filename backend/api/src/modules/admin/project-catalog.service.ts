import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { JK_NAGAR_PROJECTS, LEAD_TYPE_PROJECT_SLUG } from './project-validation.js';

@Injectable()
export class ProjectCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create the three JK Nagar phases once. Later edits in admin are left untouched. */
  async ensureCanonicalProjects() {
    for (const project of JK_NAGAR_PROJECTS) {
      const existing = await this.prisma.project.findUnique({ where: { slug: project.slug }, select: { id: true } });
      if (existing) continue;
      await this.prisma.project.create({ data: project });
    }

    for (const [leadType, slug] of Object.entries(LEAD_TYPE_PROJECT_SLUG)) {
      const project = await this.prisma.project.findUnique({ where: { slug }, select: { id: true } });
      if (!project) continue;
      await this.prisma.lead.updateMany({
        where: { leadType, projectId: null },
        data: { projectId: project.id },
      });
    }
  }

  async resolvePublishedProjectId(slug: string | undefined): Promise<string | undefined> {
    if (!slug) return undefined;
    const project = await this.prisma.project.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });
    if (!project?.published) return undefined;
    return project.id;
  }

  async resolveProjectId(slug: string | undefined): Promise<string | undefined> {
    if (!slug) return undefined;
    const project = await this.prisma.project.findUnique({ where: { slug }, select: { id: true } });
    return project?.id;
  }
}
