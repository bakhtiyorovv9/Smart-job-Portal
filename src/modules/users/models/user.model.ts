import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Company } from '../../companies/models/company.model';
import { UserRole } from '@/core/constants/constants';
import { Application } from '../../applications/models/application.model';

export interface UserCreationAttrs {
  full_name: string;
  email: string;
  password: string;
  role?: UserRole;
  telegram_id?: string;
  is_active?: boolean;
  otp_code?: string;
  otp_expires?: Date;
}

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class User extends Model<User, UserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare position: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare phone: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare city: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare bio: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.CANDIDATE,
    allowNull: false,
  })
  declare role: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare telegram_id: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_active: boolean;

  @HasMany(() => Company, 'owner_id')
  declare companies: Company[];

  @HasMany(() => Application)
  declare applications: Application[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare otp_code: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare otp_expires: Date;
}
