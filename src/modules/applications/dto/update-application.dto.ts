import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '@/core/constants/constants';

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
