import { ProjectStatus } from '@prisma/client';
import { ArrayUnique, IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status: ProjectStatus = ProjectStatus.ACTIVE;

  @IsUUID()
  managerId!: string;

  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  memberIds!: string[];
}
