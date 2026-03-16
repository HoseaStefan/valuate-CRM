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
	tableName: 'payroll',
	timestamps: true,
	updatedAt: false,
})
export class Payroll extends Model {
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
	month!: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	year!: number;

	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: false,
	})
	baseSalary!: string;

	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: false,
	})
	totalAdjustments!: string;

	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: false,
	})
	netSalary!: string;

	@Column({
		type: DataType.ENUM('pending', 'paid', 'failed'),
		allowNull: false,
	})
	status!: 'pending' | 'paid' | 'failed';

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	paymentDate!: Date | null;
}
