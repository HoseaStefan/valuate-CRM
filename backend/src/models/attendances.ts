import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './users';

@Table({
  tableName: 'attendances',
  timestamps: false,
})
export class Attendance extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date!: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  clockIn!: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  clockOut!: string;

  @Column({
    type: DataType.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
  })
  status!: 'present' | 'absent' | 'late' | 'excused';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  notes!: string | null;
}
