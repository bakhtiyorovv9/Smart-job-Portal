import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { VacanciesService } from '../vacancies/vacancies.service';
import { CategoriesService } from '../categories/categories.service';
import { ApplicationsService } from '../applications/applications.service';
import { FilterVacancyDto } from '../vacancies/dto/filter-vacancy.dto';
import { SavedVacanciesService } from '../saved-vacancies/saved-vacancies.service';
import { CompaniesService } from '../companies/companies.service';
import { UserService } from '../users/users.service';

@Controller()
export class PagesController {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly categoriesService: CategoriesService,
    private readonly applicationsService: ApplicationsService,
    private readonly savedVacanciesService: SavedVacanciesService,
    private readonly companiesService: CompaniesService,
    private readonly usersService: UserService,
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

  @Get('my-vacancies')
  async companyVacancies(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user) return res.redirect('/auth/sign-in');

    const company =
      user.role === 'company'
        ? await this.companiesService.getOrCreateByOwner(user.id)
        : await this.companiesService.getByOwner(user.id);

    let vacancies: any[] = [];
    if (company) {
      const vRes = await this.vacanciesService.getByCompany(company.id);
      vacancies = vRes.data || [];
    }

    const totalApplications = vacancies.reduce(
      (sum, v) => sum + (v.applications?.length || 0),
      0,
    );
    const activeCount = vacancies.filter((v) => v.is_active).length;

    return res.render('pages/company-vacancies', {
      active: 'my-vacancies',
      user,
      company,
      vacancies,
      stats: {
        active: activeCount,
        total: vacancies.length,
        applications: totalApplications,
      },
    });
  }

  @Get('create-vacancy')
  async createVacancyPage(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user) return res.redirect('/auth/sign-in');

    const company =
      user.role === 'company'
        ? await this.companiesService.getOrCreateByOwner(user.id)
        : await this.companiesService.getByOwner(user.id);
    const cats = await this.categoriesService.getAll();

    return res.render('pages/create-vacancy', {
      active: 'create-vacancy',
      user,
      company,
      categories: cats.data,
    });
  }

  @Get('company-applications')
  async companyApplications(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user) return res.redirect('/auth/sign-in');

    const company =
      user.role === 'company'
        ? await this.companiesService.getOrCreateByOwner(user.id)
        : await this.companiesService.getByOwner(user.id);

    let vacancies: any[] = [];
    let applications: any[] = [];
    if (company) {
      const vRes = await this.vacanciesService.getByCompany(company.id);
      vacancies = vRes.data || [];
      const aRes = await this.applicationsService.getByCompany(company.id);
      applications = aRes.data || [];
    }

    return res.render('pages/company-applications', {
      active: 'company-applications',
      user,
      company,
      vacancies,
      applications,
    });
  }


  @Get('admin/users')
  async adminUsers(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.redirect('/');
    }
    const usersRes = await this.usersService.getAll();
    const users = usersRes.data || [];
    const stats = {
      total: users.length,
      candidates: users.filter((u: any) => u.role === 'candidate').length,
      companies: users.filter((u: any) => u.role === 'company').length,
      admins: users.filter((u: any) => u.role === 'admin').length,
    };
    return res.render('pages/admin-users', {
      active: 'admin-users',
      user,
      users,
      stats,
    });
  }

  @Get('admin/companies')
  async adminCompanies(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.redirect('/');
    }
    const result = await this.companiesService.getAll();
    return res.render('pages/admin-companies', {
      active: 'admin-companies',
      user,
      companies: result.data,
    });
  }

  @Get('admin/categories')
  async adminCategories(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.redirect('/');
    }
    const result = await this.categoriesService.getAll();
    return res.render('pages/admin-categories', {
      active: 'admin-categories',
      user,
      categories: result.data,
    });
  }

  @Get('telegram')
  async telegramPage(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    if (!user) return res.redirect('/auth/sign-in');
    return res.render('pages/telegram', { active: 'telegram', user });
  }
}
