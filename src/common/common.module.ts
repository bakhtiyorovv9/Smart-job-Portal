import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../modules/mail/mail.module';
import { TelegramModule } from '../modules/telegram/telegram.module';

@Global()
@Module({
  imports: [JwtModule.register({}), ConfigModule, MailModule, TelegramModule],
  exports: [JwtModule, ConfigModule, MailModule, TelegramModule],
})
export class CommonModule {}
