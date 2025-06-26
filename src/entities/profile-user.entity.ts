import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from './company.entity';
import { UserRole } from './user-role.entity';
import { Document } from './document.entity';

@Entity('ProfileUser')
export class ProfileUser {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'CompanyId' })
  companyId: number;

  @ManyToOne(() => Company, company => company.profileUsers)
  @JoinColumn({ name: 'CompanyId' })
  company: Company;

  @Column({ name: 'FirstName', length: 200, nullable: false })
  firstName: string;

  @Column({ name: 'LastName', length: 200, nullable: false })
  lastName: string;

  @Column({ name: 'Email', length: 500, unique: true, nullable: false })
  email: string;

  @Column({ name: 'UserName', length: 100, unique: true, nullable: false })
  userName: string;

  @Column({ name: 'Password', length: 100, nullable: false })
  password: string;

  @Column({ name: 'Phone', length: 100, nullable: false })
  phone: string;

  @Column({ name: 'CreatedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'ModifiedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;

  @Column({ name: 'Enable', type: 'boolean', default: true, nullable: false })
  enable: boolean;

  @Column({ name: 'Blocked', type: 'boolean', default: false, nullable: false })
  blocked: boolean;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Document, document => document.user)
  documents: Document[];

  // Propiedad virtual para almacenar los roles del usuario, no mapeada a la DB
  roles: string[];
}
