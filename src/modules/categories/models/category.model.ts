import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Vacancy } from '../../vacancies/models/vacancy.model';

export interface CategoryCreationAttrs {
  name: string;
}

@Table({
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Category extends Model<Category, CategoryCreationAttrs> {
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

  @HasMany(() => Vacancy)
  declare vacancies: Vacancy[];
}
