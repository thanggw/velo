import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [projectCount, activeUsers, tasksByStatus] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.task.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const taskCounts = Object.values(TaskStatus).reduce<Record<TaskStatus, number>>((acc, status) => {
      acc[status] = tasksByStatus.find((item) => item.status === status)?._count._all ?? 0;
      return acc;
    }, {} as Record<TaskStatus, number>);
    const totalTasks = Object.values(taskCounts).reduce((total, count) => total + count, 0);
    const doneTasks = taskCounts.DONE;

    return {
      projectCount,
      activeUsers,
      totalTasks,
      doneTasks,
      completionRate: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
      taskCounts,
    };
  }
}
