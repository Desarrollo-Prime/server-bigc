import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';
import { Role } from './role.entity';

@Entity('DocumentPermission')
export class DocumentPermission {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'DocumentId' })
  documentId: number;

  @ManyToOne(() => Document, document => document.documentPermissions)
  @JoinColumn({ name: 'DocumentId' })
  document: Document;

  @Column({ name: 'RoleId' })
  roleId: number;

  @ManyToOne(() => Role, role => role.documentPermissions)
  @JoinColumn({ name: 'RoleId' })
  role: Role;

  @Column({ name: 'CanView', type: 'boolean', default: false, nullable: false })
  canView: boolean;

  @Column({ name: 'CanEdit', type: 'boolean', default: false, nullable: false })
  canEdit: boolean;

  @Column({ name: 'CanDelete', type: 'boolean', default: false, nullable: false })
  canDelete: boolean;

  @Column({ name: 'CreatedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'ModifiedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;
}