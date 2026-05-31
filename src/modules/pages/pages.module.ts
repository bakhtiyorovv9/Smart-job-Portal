import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { VacanciesModule } from '../vacancies/vacancies.module';
import { CategoriesModule } from '../categories/categories.module';
import { ApplicationsModule } from '../applications/applications.module';
import { SavedVacanciesModule } from '../saved-vacancies/saved-vacancies.module';
import { CompaniesModule } from '../companies/companies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    VacanciesModule,
    CategoriesModule,
    ApplicationsModule,
    SavedVacanciesModule,
    CompaniesModule,
    UsersModule,
  ],
  controllers: [PagesController],
})
export class PagesModule {}
