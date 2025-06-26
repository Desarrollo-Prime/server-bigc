import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Area } from './area.entity';
import { ProfileUser } from './profile-user.entity';
import { DocumentStatus } from './document-status.entity';
import { DocumentPermission } from './document-permission.entity';

@Entity('Document')
export class Document {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'CompanyId' })
  companyId: number;

  @ManyToOne(() => Company, company => company.documents)
  @JoinColumn({ name: 'CompanyId' })
  company: Company;

  @Column({ name: 'AreaId', nullable: true })
  areaId: number;

  @ManyToOne(() => Area, area => area.documents)
  @JoinColumn({ name: 'AreaId' })
  area: Area;

  @Column({ name: 'UserId', nullable: true })
  userId: number;

  @ManyToOne(() => ProfileUser, profileUser => profileUser.documents)
  @JoinColumn({ name: 'UserId' })
  user: ProfileUser;

  @Column({ name: 'Name', length: 500, nullable: false })
  name: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'FileName', length: 500, nullable: true })
  fileName: string;

  @Column({ name: 'FileExtension', length: 100, nullable: true })
  fileExtension: string;

  @Column({ name: 'FilePath', length: 500, nullable: false })
  filePath: string;

  @Column({ name: 'StatusId' })
  statusId: number;

  @ManyToOne(() => DocumentStatus, documentStatus => documentStatus.documents)
  @JoinColumn({ name: 'StatusId' })
  status: DocumentStatus;

  @Column({ name: 'CreatedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'ModifiedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;

  @OneToMany(() => DocumentPermission, docPermission => docPermission.document)
  documentPermissions: DocumentPermission[];
}