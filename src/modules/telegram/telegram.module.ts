import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { User } from '../users/models/user.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { Application } from '../applications/models/application.model';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const proxy = config.get<string>('TELEGRAM_PROXY');
        return {
          token: config.getOrThrow<string>('BOT_TOKEN'),
          ...(proxy && {
            telegram: {
              agent: new SocksProxyAgent(proxy),
            },
          }),
          launchOptions: {
            dropPendingUpdates: true,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forFeature([User, Vacancy, Application]),
  ],
  providers: [TelegramService, TelegramUpdate],
  exports: [TelegramService],
})
export class TelegramModule {}
