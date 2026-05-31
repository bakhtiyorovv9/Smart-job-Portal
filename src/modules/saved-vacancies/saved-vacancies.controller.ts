import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SavedVacanciesService } from './saved-vacancies.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/constants/constants';

@Controller('api/saved-vacancies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CANDIDATE)
export class SavedVacanciesController {
  constructor(private readonly service: SavedVacanciesService) {}

  @Post(':vacancyId')
  async save(@Req() req: Request, @Param('vacancyId', ParseIntPipe) vacancyId: number) {
    return this.service.save(req.user.id, vacancyId);
  }

  @Get()
  async getSaved(@Req() req: Request) {
    return this.service.getSaved(req.user.id);
  }

  @Get(':vacancyId/check')
  async isSaved(@Req() req: Request, @Param('vacancyId', ParseIntPipe) vacancyId: number) {
    return this.service.isSaved(req.user.id, vacancyId);
  }

  @Delete(':vacancyId')
  async remove(@Req() req: Request, @Param('vacancyId', ParseIntPipe) vacancyId: number) {
    return this.service.remove(req.user.id, vacancyId);
  }
}
