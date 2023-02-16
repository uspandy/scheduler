import {
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
} from 'typeorm';

import { BaseEntityFields, baseVarcharLength } from './baseFields';
import { DepartmentEntity } from './department.entity';
import { RoleEntity } from './role.entity';

export enum UserStatusEnum {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  NOT_ACTIVATED = 'NOT_ACTIVATED',
}

@Entity({ name: 'user' })
export class UserEntity extends BaseEntityFields {
    @Column({
        type: 'varchar',
        length: baseVarcharLength,
        unique: true,
    })
    email: string;

    @Index()
    @Column({
        type: 'enum',
        'enum': UserStatusEnum,
        'default': UserStatusEnum.NOT_ACTIVATED,
    })
    status: UserStatusEnum;

    @Column({
        type: 'varchar',
        length: baseVarcharLength,
    })
    password: string;

    @Column({
        type: 'varchar',
        length: baseVarcharLength,
    })
    salt: string;

    @ManyToMany(() => RoleEntity, { cascade: true })
    @JoinTable({
        name: 'users__roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id' },
    })
    roles: RoleEntity[];

    @ManyToMany(() => DepartmentEntity, { cascade: true })
    @JoinTable({
        name: 'users__departments',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'department_id' },
    })
    departments: DepartmentEntity[];

    @Column({
        type: 'timestamptz',
        name: 'last_logon_at',
        nullable: true,
    })
    lastLogonAt?: Date;

    @Column({
        type: 'timestamptz',
        name: 'blocked_at',
        nullable: true,
    })
    blockedAt?: Date;

    @Column({
        type: 'timestamptz',
        name: 'activated_at',
        nullable: true,
    })
    activatedAt?: Date;

    totalSchedulesDurationInHoursByPeriod?: number;
}
