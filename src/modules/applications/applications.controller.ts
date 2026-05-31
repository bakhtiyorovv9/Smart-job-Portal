import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/constants/constants';
import { ResumeValidationPipe } from '@/common/pipes/resume-validation.pipe';

@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new Error('Only PDF/DOC/DOCX files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() payload: CreateApplicationDto,
    @UploadedFile(ResumeValidationPipe) resume: Express.Multer.File,
  ) {
    return this.service.create(payload, resume);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  async getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getByUser(userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateApplicationDto,
  ) {
    return this.service.updateStatus(id, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
