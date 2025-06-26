import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from './document.entity';

@Entity('DocumentStatus')
export class DocumentStatus {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

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

  @OneToMany(() => Document, document => document.status)
  documents: Document[];
}
