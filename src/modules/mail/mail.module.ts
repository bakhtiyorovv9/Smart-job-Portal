import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>('EMAIL_HOST'),
          port: Number(config.getOrThrow<string>('EMAIL_PORT')),
          secure: false,
          auth: {
            user: config.getOrThrow<string>('EMAIL_USER'),
            pass: config.getOrThrow<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: config.getOrThrow<string>('EMAIL_FROM'),
        },
        template: {
          dir: join(process.cwd(), 'src', 'modules', 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
