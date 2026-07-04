import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/types/jwt-payload';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:projectId/tasks')
  findByProject(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string) {
    return this.tasksService.findByProject(user, projectId);
  }

  @Post('projects/:projectId/tasks')
  create(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user, projectId, dto);
  }

  @Patch('tasks/:id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(user, id, dto);
  }

  @Patch('tasks/:id/move')
  move(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.tasksService.move(user, id, dto);
  }

  @Delete('tasks/:id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.remove(user, id);
  }
}
