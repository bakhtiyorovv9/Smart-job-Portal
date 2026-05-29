import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole } from '@/core/constants/constants';

export class SignUpDto {
  @IsString({ message: 'Ism matn bo\u2018lishi kerak' })
  @MinLength(3, { message: 'Ism kamida 3 ta belgidan iborat bo\u2018lsin' })
  @MaxLength(100, { message: 'Ism 100 belgidan oshmasin' })
  full_name!: string;

  @IsEmail({}, { message: 'Email manzil noto\u2018g\u2018ri' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\u2018lsin' })
  @MaxLength(32, { message: 'Parol 32 belgidan oshmasin' })
  password!: string;

  @IsOptional() 
  @IsString()
  password_confirm?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role faqat admin, company yoki candidate' })
  role?: UserRole;
}
