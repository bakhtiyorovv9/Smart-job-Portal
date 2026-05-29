import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, {
    message: 'Kategoriya nomi kamida 2 ta belgidan iborat bo\u2018lsin',
  })
  @MaxLength(50)
  name!: string;
}
