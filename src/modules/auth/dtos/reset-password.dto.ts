import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6, {
    message: 'Yangi parol kamida 6 ta belgidan iborat bo\u2018lsin',
  })
  @MaxLength(32)
  newPassword!: string;
}
