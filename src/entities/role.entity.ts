import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { DocumentPermission } from './document-permission.entity';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'Name', length: 100, nullable: false })
  name: string;

  @Column({
    name: 'CreatedDate',
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({
    name: 'ModifiedDate',
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;

  @Column({ name: 'Enable', type: 'boolean', default: true })
  enable: boolean;

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => DocumentPermission, docPermission => docPermission.role)
  documentPermissions: DocumentPermission[];
}