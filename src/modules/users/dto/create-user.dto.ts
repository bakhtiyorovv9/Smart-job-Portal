import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../../core/constants/constants';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Ism kamida 3 ta belgidan iborat bo\u2018lsin' })
  @MaxLength(100)
  full_name!: string;

  @IsEmail({}, { message: 'Email manzil noto\u2018g\u2018ri' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\u2018lsin' })
  @MaxLength(32)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  telegram_id?: string;
}
