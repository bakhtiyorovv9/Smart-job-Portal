import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './models/user.model';
import { Company } from '../companies/models/company.model';
import { Application } from '../applications/models/application.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly model: typeof User) {}

  async create(dto: CreateUserDto) {
    const exists = await this.model.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.model.create({
      ...dto,
      password: hashed,
    });

    const { password, ...safe } = user.toJSON();

    return {
      success: true,
      message: 'User created successfully',
      data: safe,
    };
  }

  async getAll() {
    const users = await this.model.findAll({
      attributes: { exclude: ['password'] },
      include: [Company, Application],
    });

    return {
      success: true,
      data: users,
    };
  }

  async getOne(id: number) {
    const user = await this.model.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [Company, Application],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      success: true,
      data: user,
    };
  }

  async findByEmail(email: string) {
    return this.model.findOne({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.model.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    await user.update(dto);

    const { password, ...safe } = user.toJSON();

    return {
      success: true,
      message: 'User updated successfully',
      data: safe,
    };
  }

  async remove(id: number) {
    const user = await this.model.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await user.destroy();

    return {
      success: true,
      message: `User with id ${id} deleted`,
    };
  }

  async activate(id: number) {
    const user = await this.model.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await user.update({ is_active: true });

    return {
      success: true,
      message: 'User activated successfully',
    };
  }

  async setTelegramId(id: number, telegram_id: string) {
    const user = await this.model.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await user.update({ telegram_id });

    return {
      success: true,
      message: 'Telegram ID linked successfully',
    };
  }
}
