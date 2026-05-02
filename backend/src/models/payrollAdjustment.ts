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
  tableName: 'PayrollAdjustments',
  timestamps: true,
})
export class PayrollAdjustment extends Model {
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
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.ENUM(
      'bonus',
      'deduction',
      'damage',
      'lateFine',
      'reimbursement',
      'others',
    ),
    allowNull: false,
  })
  type!:
    | 'bonus'
    | 'deduction'
    | 'damage'
    | 'lateFine'
    | 'reimbursement'
    | 'others';

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  proofPath!: string | null;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
  })
  status!: 'pending' | 'approved' | 'rejected' | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  reviewedBy!: number;

  @BelongsTo(() => User, 'reviewedBy')
  reviewer?: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  rejectionReason!: string | null;
}
