import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../modules/users/models/user.model';
import { Category } from '../modules/categories/models/category.model';
import { SeedService } from './seed.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Category])],
  providers: [SeedService],
})
export class SeedModule {}
