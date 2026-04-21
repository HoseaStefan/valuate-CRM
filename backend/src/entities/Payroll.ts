import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('payroll')
export class Payroll {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: false })
  month: string;

  @Column({ type: 'int', nullable: false })
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  baseSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  totalAdjustments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  netSalary: number;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'failed'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  paymentDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
