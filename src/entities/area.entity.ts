import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Document } from './document.entity';

@Entity('Area')
export class Area {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'CompanyId' })
  companyId: number;

  @ManyToOne(() => Company, company => company.areas)
  @JoinColumn({ name: 'CompanyId' })
  company: Company;

  @Column({ name: 'Name', length: 100, nullable: false })
  name: string;

  @Column({ name: 'Description', length: 500, nullable: true })
  description: string;

  @Column({ name: 'CreatedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'ModifiedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;

  @OneToMany(() => Document, document => document.area)
  documents: Document[];
}