import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: false })
  fullName: string;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  photoPath: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @Column({ type: 'int', nullable: true })
  managerId: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'managerId' })
  manager?: User;

  @Column({ type: 'int', nullable: false, default: 0 })
  baseSalary: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
