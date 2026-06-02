import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @Type(() => Number)
  @IsInt()
  vacancy_id!: number;
}
