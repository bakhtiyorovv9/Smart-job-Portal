import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private readonly model: typeof Category) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.model.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Category already exists');
    }

    const category = await this.model.create(dto);
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async getAll() {
    const categories = await this.model.findAll();
    return { success: true, data: categories };
  }

  async getOne(id: number) {
    const category = await this.model.findByPk(id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return { success: true, data: category };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.model.findByPk(id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (dto.name) {
      const duplicate = await this.model.findOne({ where: { name: dto.name } });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    await category.update(dto);
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  async remove(id: number) {
    const category = await this.model.findByPk(id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    await category.destroy();
    return { success: true, message: `Category ${id} deleted` };
  }
}
