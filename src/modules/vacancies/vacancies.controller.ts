import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FilterVacancyDto } from './dto/filter-vacancy.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/constants/constants';
import { ParseVacancyIdPipe } from '@/common/pipes/parse-vacancy-id.pipe';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly service: VacanciesService) {}

  @Get()
  async getAll(@Query() filter: FilterVacancyDto) {
    return this.service.getAll(filter);
  }
  @Get(':id')
  async getOne(@Param('id', ParseVacancyIdPipe) id: number) {
    return this.service.getOne(id);
  }

  @Get('company/:companyId')
  async getByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.service.getByCompany(companyId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  async create(@Body() payload: CreateVacancyDto) {
    return this.service.create(payload);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  async update(
    @Param('id', ParseVacancyIdPipe) id: number,
    @Body() payload: UpdateVacancyDto,
  ) {
    return this.service.update(id, payload);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  async toggleActive(@Param('id', ParseVacancyIdPipe) id: number) {
    return this.service.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  async remove(@Param('id', ParseVacancyIdPipe) id: number) {
    return this.service.remove(id);
  }
}
