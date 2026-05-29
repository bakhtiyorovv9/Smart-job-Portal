import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import type { Request, Response } from 'express';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() payload: SignUpDto, @Res() res: Response) {
    return this.service.register(payload, res);
  }

  @Post('/sign-in')
  async signIn(@Body() payload: SignInDto, @Res() res: Response) {
    return this.service.login(payload, res);
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    return this.service.refresh(req, res);
  }

  @Post('/logout')
  async logout(@Res() res: Response) {
    return this.service.logout(res);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.service.forgotPassword(payload.email);
  }

  @Post('/reset-password')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    return this.service.resetPassword(payload);
  }

  @Get('/activate/:id')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() payload: VerifyOtpDto) {
    return this.service.verifyOtp(payload.email, payload.code);
  }

  @Post('/resend-otp')
  async resendOtp(@Body() payload: ForgotPasswordDto) {
    return this.service.resendOtp(payload.email);
  }

  @Get('/logout')
  logoutPage(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.redirect('/auth/sign-in');
  }
}
