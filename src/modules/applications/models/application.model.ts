import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { ApplicationStatus } from '@/core/constants/constants';
import { Vacancy } from '../../vacancies/models/vacancy.model';

export interface ApplicationCreationAttrs {
  user_id: number;
  vacancy_id: number;
  resume: string;
  status?: ApplicationStatus;
}

@Table({
  tableName: 'applications',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Application extends Model<Application, ApplicationCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Vacancy)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare vacancy_id: number;

  @BelongsTo(() => Vacancy)
  declare vacancy: Vacancy;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare resume: string;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    defaultValue: ApplicationStatus.PENDING,
    allowNull: false,
  })
  declare status: ApplicationStatus;
}
