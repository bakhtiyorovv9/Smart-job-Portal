import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2, {
    message: 'Kompaniya nomi kamida 2 ta belgidan iborat bo\u2018lsin',
  })
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsUrl(
    {},
    {
      message: 'Website manzili noto\u2018g\u2018ri (https://... bo\u2018lsin)',
    },
  )
  website?: string;

  @Type(() => Number)
  @IsInt({ message: 'owner_id raqam bo\u2018lishi kerak' })
  @Min(1)
  owner_id!: number;
}
