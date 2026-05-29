import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Vacancy } from './models/vacancy.model';
import { Company } from '../companies/models/company.model';
import { Category } from '../categories/models/category.model';
import { Application } from '../applications/models/application.model';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FilterVacancyDto } from './dto/filter-vacancy.dto';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectModel(Vacancy) private readonly model: typeof Vacancy,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  async create(dto: CreateVacancyDto) {
    const company = await this.companyModel.findByPk(dto.company_id);
    if (!company) {
      throw new NotFoundException(`Company ${dto.company_id} not found`);
    }

    const category = await this.categoryModel.findByPk(dto.category_id);
    if (!category) {
      throw new NotFoundException(`Category ${dto.category_id} not found`);
    }

    const vacancy = await this.model.create(dto);
    return {
      success: true,
      message: 'Vacancy created successfully',
      data: vacancy,
    };
  }

  async getAll(filter: FilterVacancyDto) {
    const where: any = { is_active: true };

    if (filter.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filter.search}%` } },
        { description: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    if (filter.location) {
      where.location = { [Op.iLike]: `%${filter.location}%` };
    }

    if (filter.category_id) where.category_id = filter.category_id;
    if (filter.company_id) where.company_id = filter.company_id;

    if (filter.min_salary || filter.max_salary) {
      where.salary = {};
      if (filter.min_salary) where.salary[Op.gte] = filter.min_salary;
      if (filter.max_salary) where.salary[Op.lte] = filter.max_salary;
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      include: [Company, Category],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      success: true,
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getOne(id: number) {
    const vacancy = await this.model.findByPk(id, {
      include: [Company, Category, Application],
    });
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${id} not found`);
    }
    return { success: true, data: vacancy };
  }

  async getByCompany(companyId: number) {
    const vacancies = await this.model.findAll({
      where: { company_id: companyId },
      include: [Category],
      order: [['created_at', 'DESC']],
    });
    return { success: true, data: vacancies };
  }

  async update(id: number, dto: UpdateVacancyDto) {
    const vacancy = await this.model.findByPk(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${id} not found`);
    }

    if (dto.company_id) {
      const company = await this.companyModel.findByPk(dto.company_id);
      if (!company) {
        throw new NotFoundException(`Company ${dto.company_id} not found`);
      }
    }

    if (dto.category_id) {
      const category = await this.categoryModel.findByPk(dto.category_id);
      if (!category) {
        throw new NotFoundException(`Category ${dto.category_id} not found`);
      }
    }

    await vacancy.update(dto);
    return {
      success: true,
      message: 'Vacancy updated successfully',
      data: vacancy,
    };
  }

  async toggleActive(id: number) {
    const vacancy = await this.model.findByPk(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${id} not found`);
    }
    await vacancy.update({ is_active: !vacancy.is_active });
    return {
      success: true,
      message: `Vacancy is now ${vacancy.is_active ? 'active' : 'inactive'}`,
      data: vacancy,
    };
  }

  async remove(id: number) {
    const vacancy = await this.model.findByPk(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${id} not found`);
    }
    await vacancy.destroy();
    return { success: true, message: `Vacancy ${id} deleted` };
  }
}
