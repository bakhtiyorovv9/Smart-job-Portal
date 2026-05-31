import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/models/user.model';
import { UserRole } from '../core/constants/constants';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
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
}
