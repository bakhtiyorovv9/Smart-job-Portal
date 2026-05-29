import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Company } from '../../companies/models/company.model';
import { Category } from '../../categories/models/category.model';
import { Application } from '../../applications/models/application.model';

export interface VacancyCreationAttrs {
  title: string;
  description: string;
  salary?: number;
  location?: string;
  company_id: number;
  category_id: number;
  is_active?: boolean;
}

@Table({
  tableName: 'vacancies',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Vacancy extends Model<Vacancy, VacancyCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare salary: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare location: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare company_id: number;

  @BelongsTo(() => Company)
  declare company: Company;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare category_id: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare is_active: boolean;

  @HasMany(() => Application)
  declare applications: Application[];
}
