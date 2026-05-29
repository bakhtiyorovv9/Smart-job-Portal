import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { Application } from './models/application.model';
import { User } from '../users/models/user.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { MailService } from '../mail/mail.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application) private readonly model: typeof Application,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateApplicationDto, resumeFile: Express.Multer.File) {
    if (!resumeFile) {
      throw new ConflictException('Resume file is required');
    }

    const user = await this.userModel.findByPk(dto.user_id);
    if (!user) {
      throw new NotFoundException(`User ${dto.user_id} not found`);
    }

    const vacancy = await this.vacancyModel.findByPk(dto.vacancy_id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${dto.vacancy_id} not found`);
    }

    const exists = await this.model.findOne({
      where: { user_id: dto.user_id, vacancy_id: dto.vacancy_id },
    });
    if (exists) {
      throw new ConflictException('You already applied to this vacancy');
    }

    const application = await this.model.create({
      user_id: dto.user_id,
      vacancy_id: dto.vacancy_id,
      resume: resumeFile.filename,
    });

    return {
      success: true,
      message: 'Application submitted successfully',
      data: application,
    };
  }

  async getAll() {
    const applications = await this.model.findAll({
      include: [
        { model: User, attributes: { exclude: ['password'] } },
        { model: Vacancy },
      ],
    });
    return { success: true, data: applications };
  }

  async getOne(id: number) {
    const application = await this.model.findByPk(id, {
      include: [
        { model: User, attributes: { exclude: ['password'] } },
        { model: Vacancy },
      ],
    });
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }
    return { success: true, data: application };
  }

  async getByUser(userId: number) {
    const applications = await this.model.findAll({
      where: { user_id: userId },
      include: [Vacancy],
    });
    return { success: true, data: applications };
  }

  async updateStatus(id: number, dto: UpdateApplicationDto) {
    const application = await this.model.findByPk(id, {
      include: [
        { model: User, attributes: { exclude: ['password'] } },
        { model: Vacancy },
      ],
    });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    await application.update({ status: dto.status });

    if (application.user && application.vacancy) {
      await this.mailService.sendApplicationStatus(
        application.user.email,
        application.user.full_name,
        application.vacancy.title,
        dto.status,
      );
    }

    return {
      success: true,
      message: 'Application status updated',
      data: application,
    };
  }

  async remove(id: number) {
    const application = await this.model.findByPk(id);
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    const filePath = path.join(process.cwd(), 'uploads', application.resume);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await application.destroy();
    return { success: true, message: `Application ${id} deleted` };
  }
}
