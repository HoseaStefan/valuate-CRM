import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('payroll_adjustments')
export class PayrollAdjustment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'enum', enum: ['bonus', 'deduction', 'damage', 'lateFine', 'reimbursement', 'others'], nullable: false })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  proofPath: string | null;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'int', nullable: true })
  reviewedById: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedById' })
  reviewer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
