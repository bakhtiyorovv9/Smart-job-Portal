import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SavedVacancy } from './models/saved-vacancy.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { SavedVacanciesService } from './saved-vacancies.service';
import { SavedVacanciesController } from './saved-vacancies.controller';

@Module({
  imports: [SequelizeModule.forFeature([SavedVacancy, Vacancy])],
  controllers: [SavedVacanciesController],
  providers: [SavedVacanciesService],
  exports: [SavedVacanciesService],
})
export class SavedVacanciesModule {}
