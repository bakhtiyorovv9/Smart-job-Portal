import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Email manzil noto\u2018g\u2018ri' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'Kod 6 ta raqamdan iborat bo\u2018lishi kerak' })
  code!: string;
}
