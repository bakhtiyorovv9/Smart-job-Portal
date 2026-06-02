import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './models/vacancy.model';
import { Company } from '../companies/models/company.model';
import { Category } from '../categories/models/category.model';
import { Application } from '../applications/models/application.model';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Vacancy, Company, Category, Application]),
    CompaniesModule,
  ],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [VacanciesService],
})
export class VacanciesModule {}
