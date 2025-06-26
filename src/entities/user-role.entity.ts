import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProfileUser } from './profile-user.entity';
import { Role } from './role.entity';

@Entity('UserRole')
export class UserRole {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'UserId' })
  userId: number;

  @ManyToOne(() => ProfileUser, profileUser => profileUser.userRoles)
  @JoinColumn({ name: 'UserId' })
  user: ProfileUser;

  @Column({ name: 'RoleId' })
  roleId: number;

  @ManyToOne(() => Role, role => role.userRoles)
  @JoinColumn({ name: 'RoleId' })
  role: Role;

  @Column({ name: 'CreatedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'ModifiedDate', type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: false })
  modifiedBy: string;
}