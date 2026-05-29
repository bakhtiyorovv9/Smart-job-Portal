import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Vacancy } from '../../vacancies/models/vacancy.model';

export interface SavedVacancyCreationAttrs {
  user_id: number;
  vacancy_id: number;
}

@Table({ tableName: 'saved_vacancies', timestamps: true, underscored: true })
export class SavedVacancy extends Model<SavedVacancy, SavedVacancyCreationAttrs> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare vacancy_id: number;

  @BelongsTo(() => Vacancy)
  declare vacancy: Vacancy;
}
