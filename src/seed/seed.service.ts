import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/models/user.model';
import { Category } from '../modules/categories/models/category.model';
import { UserRole } from '../core/constants/constants';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedCategories();
  }

  private async seedAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL') || 'admin@smartjob.uz';
    const password = this.config.get<string>('ADMIN_PASSWORD') || 'admin123';

    const exists = await this.userModel.findOne({ where: { email } });
    if (exists) {
      this.logger.log('Admin allaqachon mavjud');
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await this.userModel.create({
      full_name: 'Admin Adminov',
      email,
      password: hashed,
      role: UserRole.ADMIN,
      is_active: true,
    });

    this.logger.log(`Admin yaratildi: ${email} / ${password}`);
  }

  private async seedCategories() {
    const count = await this.categoryModel.count();
    if (count > 0) {
      return;
    }

    const defaults = [
      'Dasturlash / IT',
      'Marketing',
      'Dizayn',
      'Savdo',
      'Moliya / Buxgalteriya',
      'Ta’lim',
      'Logistika',
      'Boshqaruv',
    ];

    await this.categoryModel.bulkCreate(defaults.map((name) => ({ name })));
    this.logger.log(`${defaults.length} ta default kategoriya yaratildi`);
  }
}
