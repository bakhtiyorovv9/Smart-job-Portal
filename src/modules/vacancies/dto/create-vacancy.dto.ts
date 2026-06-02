import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVacancyDto {
  @IsString()
  @MinLength(3, {
    message: 'Sarlavha kamida 3 ta belgidan iborat bo\u2018lsin',
  })
  @MaxLength(150, { message: 'Sarlavha 150 belgidan oshmasin' })
  title!: string;

  @IsString()
  @MinLength(10, {
    message: 'Tavsif kamida 10 ta belgidan iborat bo\u2018lsin',
  })
  description!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Maosh butun son bo\u2018lishi kerak' })
  @Min(0, { message: 'Maosh manfiy bo\u2018lmasin' })
  @Max(1_000_000_000, { message: 'Maosh juda katta' })
  salary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'company_id raqam bo\u2018lishi kerak' })
  @Min(1)
  company_id?: number;

  @Type(() => Number)
  @IsInt({ message: 'category_id raqam bo\u2018lishi kerak' })
  @Min(1)
  category_id!: number;
}
