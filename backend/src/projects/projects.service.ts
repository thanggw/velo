import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { JwtPayload } from '../auth/types/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const projectInclude = {
  manager: {
    select: { id: true, email: true, fullName: true, role: true },
  },
  members: {
    include: {
      user: {
        select: { id: true, email: true, fullName: true, role: true },
      },
    },
  },
  _count: {
    select: { tasks: true },
  },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findVisibleProjects(user: JwtPayload) {
    const where: Prisma.ProjectWhereInput =
      user.role === Role.ADMIN
        ? {}
        : user.role === Role.MANAGER
          ? { managerId: user.sub }
          : { members: { some: { userId: user.sub } } };

    return this.prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    await this.assertCanAccessProject(user, id);

    return this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: projectInclude,
    });
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status,
        managerId: dto.managerId,
        members: {
          create: dto.memberIds.map((userId) => ({ userId })),
        },
      },
      include: projectInclude,
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateProjectDto) {
    await this.assertCanManageProject(user, id);

    const memberIds = dto.memberIds;
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate === undefined ? undefined : dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status,
        managerId: user.role === Role.ADMIN ? dto.managerId : undefined,
        members: memberIds
          ? {
              deleteMany: {},
              create: memberIds.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: projectInclude,
    });

    return project;
  }

  async remove(id: string) {
    await this.prisma.project.delete({ where: { id } });
    return { ok: true };
  }

  async assertCanAccessProject(user: JwtPayload, projectId: string) {
    if (user.role === Role.ADMIN) {
      return;
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { managerId: user.sub },
          { members: { some: { userId: user.sub } } },
        ],
      },
      select: { id: true },
    });

    if (!project) {
      throw new ForbiddenException('You cannot access this project');
    }
  }

  async assertCanManageProject(user: JwtPayload, projectId: string) {
    if (user.role === Role.ADMIN) {
      return;
    }

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, managerId: user.sub },
      select: { id: true },
    });

    if (!project) {
      throw new ForbiddenException('You cannot manage this project');
    }
  }
}
