import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { PagesModule } from './modules/pages/pages.module';
import { User } from './modules/users/models/user.model';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { SavedVacanciesModule } from './modules/saved-vacancies/saved-vacancies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'smart_job_portal',
      logging: false,
      autoLoadModels: true,
      synchronize: true,
      sync: { alter: true },
    }),

    SequelizeModule.forFeature([User]),

    CommonModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    ApplicationsModule,
    CategoriesModule,
    VacanciesModule,
    TelegramModule,
    PagesModule,
    SavedVacanciesModule
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, AuthMiddleware).forRoutes('*');
  }
}
