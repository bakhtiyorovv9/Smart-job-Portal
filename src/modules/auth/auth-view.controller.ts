import { Controller, Get, Query, Render } from '@nestjs/common';

@Controller('auth')
export class AuthViewController {
  @Get('sign-in')
  @Render('auth/sign-in')
  signIn() {
    return {
      quoteTitle:
        '"Yaxshi karyera tasodifan emas, balki to\'g\'ri tanlovdan boshlanadi."',
      quoteSubtitle: 'SmartJob jamoasi',
      footerText: '1 248 ochiq vakansiya · 418 kompaniya',
    };
  }

  @Get('sign-up')
  @Render('auth/sign-up')
  signUp() {
    return {
      quoteTitle:
        "Bir necha bosqichda ro'yxatdan o'ting, rezyume yuklang va minglab ish takliflarini oling.",
      footerText: 'Telegram va Email orqali bildirishnomalar.',
    };
  }

  @Get('verify-otp')
  @Render('auth/verify-otp')
  verifyOtp(@Query('email') email: string) {
    return { email: email || 'malika@gmail.com' };
  }
}
