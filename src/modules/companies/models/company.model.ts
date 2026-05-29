import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Vacancy } from '@/modules/vacancies/models/vacancy.model';

export interface CompanyCreationAttrs {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  owner_id: number;
}

@Table({
  tableName: 'companies',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Company extends Model<Company, CompanyCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare logo: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare website: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare owner_id: number;

  @BelongsTo(() => User)
  declare owner: User;

  @HasMany(() => Vacancy)
  declare vacancies: Vacancy[];
}
