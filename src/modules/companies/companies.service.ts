import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './models/company.model';
import { User } from '../users/models/user.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company) private readonly model: typeof Company,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async create(dto: CreateCompanyDto) {
    const owner = await this.userModel.findByPk(dto.owner_id);
    if (!owner) {
      throw new NotFoundException(`Owner with id ${dto.owner_id} not found`);
    }

    const exists = await this.model.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Company name already exists');
    }

    const company = await this.model.create(dto);
    return {
      success: true,
      message: 'Company created successfully',
      data: company,
    };
  }

  async getAll() {
    const companies = await this.model.findAll({
      include: [{ model: User, attributes: { exclude: ['password'] } }],
    });
    return { success: true, data: companies };
  }

  async getOne(id: number) {
    const company = await this.model.findByPk(id, {
      include: [{ model: User, attributes: { exclude: ['password'] } }],
    });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return { success: true, data: company };
  }

  async update(id: number, dto: UpdateCompanyDto) {
    const company = await this.model.findByPk(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    await company.update(dto);
    return {
      success: true,
      message: 'Company updated successfully',
      data: company,
    };
  }

  async remove(id: number) {
    const company = await this.model.findByPk(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    await company.destroy();
    return { success: true, message: `Company ${id} deleted` };
  }

  async getByOwner(ownerId: number) {
    const company = await this.model.findOne({ where: { owner_id: ownerId } });
    return company;
  }
  
}
