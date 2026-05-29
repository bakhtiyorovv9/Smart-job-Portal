import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @Type(() => Number)
  @IsInt()
  user_id!: number;

  @Type(() => Number)
  @IsInt()
  vacancy_id!: number;

}
