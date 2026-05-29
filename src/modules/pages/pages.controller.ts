import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Render,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { VacanciesService } from '../vacancies/vacancies.service';
import { CategoriesService } from '../categories/categories.service';
import { ApplicationsService } from '../applications/applications.service';
import { FilterVacancyDto } from '../vacancies/dto/filter-vacancy.dto';
import { SavedVacanciesService } from '../saved-vacancies/saved-vacancies.service';

@Controller()
export class PagesController {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly categoriesService: CategoriesService,
    private readonly applicationsService: ApplicationsService,
    private readonly savedVacanciesService: SavedVacanciesService,
  ) {}

  @Get()
  @Render('pages/home')
  async home(@Req() req: Request) {
    const res = await this.vacanciesService.getAll({ page: 1, limit: 10 });
    return {
      active: 'home',
      vacancies: res.data,
      user: req.user || { full_name: 'Mehmon', role: 'candidate' },
    };
  }

  @Get('vacancies')
  @Render('pages/vacancies')
  async vacancies(@Query() filter: FilterVacancyDto, @Req() req: Request) {
    const res = await this.vacanciesService.getAll(filter);
    const cats = await this.categoriesService.getAll();
    return {
      active: 'vacancies',
      vacancies: res.data,
      meta: res.meta,
      categories: cats.data,
      user: req.user || { full_name: 'Mehmon', role: 'candidate' },
    };
  }

  @Get('vacancies/:id')
  @Render('pages/vacancy-detail')
  async vacancyDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const res = await this.vacanciesService.getOne(id);
    return {
      active: 'vacancies',
      vacancy: res.data,
      user: req.user || { full_name: 'Mehmon', role: 'candidate' },
    };
  }

  @Get('my-applications')
  @Render('pages/my-applications')
  async myApplications(@Req() req: Request) {
    const user = req.user || { full_name: 'Mehmon', role: 'candidate', id: 0 };
    const res = user.id
      ? await this.applicationsService.getByUser(user.id)
      : { data: [] };
    return {
      active: 'my-applications',
      applications: res.data,
      total: res.data.length,
      user,
    };
  }

  @Get('profile')
  @Render('pages/profile')
  async profile(@Req() req: Request) {
    const user = req.user || { full_name: 'Mehmon', role: 'candidate', id: 0 };
    const appsRes = user.id
      ? await this.applicationsService.getByUser(user.id)
      : { data: [] };
    const savedRes = user.id
      ? await this.savedVacanciesService.getSaved(user.id)
      : { data: [] };
    return {
      active: 'profile',
      user,
      applicationsCount: appsRes.data.length,
      savedCount: savedRes.data.length,
    };
  }

  @Get('saved-vacancies')
  @Render('pages/saved-vacancies')
  async savedVacanciesPage(@Req() req: Request) {
    const user = req.user || { full_name: 'Mehmon', role: 'candidate', id: 0 };
    const res = user.id
      ? await this.savedVacanciesService.getSaved(user.id)
      : { data: [] };
    return {
      active: 'saved-vacancies',
      savedVacancies: res.data,
      user,
    };
  }
}
