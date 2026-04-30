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
  tableName: 'leaveRequests',
  timestamps: true,
})
export class LeaveRequest extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @Column({
    type: DataType.ENUM('vacation', 'sick leave', 'personal leave', 'other'),
    allowNull: false,
  })
  reason!: 'vacation' | 'sick leave' | 'personal leave' | 'other';

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate!: Date;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
  })
  status!: 'pending' | 'approved' | 'rejected';

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  reviewedBy!: number | null;

  @BelongsTo(() => User, 'reviewedBy')
  reviewer?: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  rejectionReason!: string | null;
}
