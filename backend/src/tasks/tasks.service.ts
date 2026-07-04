import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Role, TaskStatus } from '@prisma/client';
import { JwtPayload } from '../auth/types/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const taskInclude = {
  assignee: {
    select: { id: true, email: true, fullName: true, role: true },
  },
  createdBy: {
    select: { id: true, email: true, fullName: true, role: true },
  },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async findByProject(user: JwtPayload, projectId: string) {
    await this.projectsService.assertCanAccessProject(user, projectId);

    return this.prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(user: JwtPayload, projectId: string, dto: CreateTaskDto) {
    await this.projectsService.assertCanManageProject(user, projectId);
    const position = dto.position ?? (await this.getNextPosition(projectId, dto.status ?? TaskStatus.TODO));

    return this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        position,
        assigneeId: dto.assigneeId,
        createdById: user.sub,
      },
      include: taskInclude,
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUniqueOrThrow({ where: { id } });
    await this.assertCanModifyTask(user, task.projectId, task.assigneeId, false);

    return this.prisma.task.update({
      where: { id },
      data: dto,
      include: taskInclude,
    });
  }

  async move(user: JwtPayload, id: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUniqueOrThrow({ where: { id } });
    await this.assertCanModifyTask(user, task.projectId, task.assigneeId, true);

    return this.prisma.task.update({
      where: { id },
      data: {
        status: dto.status,
        position: dto.position,
      },
      include: taskInclude,
    });
  }

  async remove(user: JwtPayload, id: string) {
    const task = await this.prisma.task.findUniqueOrThrow({ where: { id } });
    await this.projectsService.assertCanManageProject(user, task.projectId);
    await this.prisma.task.delete({ where: { id } });
    return { ok: true };
  }

  private async assertCanModifyTask(
    user: JwtPayload,
    projectId: string,
    assigneeId: string | null,
    statusOnlyForMember: boolean,
  ) {
    if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
      await this.projectsService.assertCanManageProject(user, projectId);
      return;
    }

    if (statusOnlyForMember && assigneeId === user.sub) {
      await this.projectsService.assertCanAccessProject(user, projectId);
      return;
    }

    throw new ForbiddenException('You cannot modify this task');
  }

  private async getNextPosition(projectId: string, status: TaskStatus) {
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId, status },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return (lastTask?.position ?? -1) + 1;
  }
}
