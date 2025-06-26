import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProfileUser } from './profile-user.entity';
import { Area } from './area.entity';
import { Document } from './document.entity';

@Entity('Company')
export class Company {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'Name', length: 200, nullable: false })
  name: string;

  @Column({ name: 'CreatedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'ModifiedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;

  @Column({ name: 'Enabled', type: 'boolean', default: true, nullable: false })
  enabled: boolean;

  @OneToMany(() => ProfileUser, profileUser => profileUser.company)
  profileUsers: ProfileUser[];

  @OneToMany(() => Area, area => area.company)
  areas: Area[];

  @OneToMany(() => Document, document => document.company)
  documents: Document[];
}
