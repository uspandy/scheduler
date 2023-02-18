import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { BaseEntityFields } from './baseFields';
import { ScheduleEntity } from './schedule.entity';
import { UserEntity } from './user.entity';

export enum AuditActionTypeEnum {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    SOFT_DELETE = 'SOFT_DELETE',
    RESTORE = 'RESTORE',
}

class BaseAuditFields extends BaseEntityFields {
    @Index()
    @Column({
        type: 'enum',
        'enum': AuditActionTypeEnum,
    })
    action: AuditActionTypeEnum;

    @ManyToOne(() => UserEntity, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({ name: 'subject_id', referencedColumnName: 'id' })
    subject: UserEntity;
}

@Entity({ name: 'audit_user' })
export class AuditUserEntity extends BaseAuditFields {
    @ManyToOne(() => UserEntity, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
    target: UserEntity;

    @Column({
        type: 'jsonb',
        nullable: true,
        'default': {},
    })
    data?: Partial<UserEntity>;
}

@Entity({ name: 'audit_schedule' })
export class AuditScheduleEntity extends BaseAuditFields {
    @ManyToOne(() => ScheduleEntity, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
    target: ScheduleEntity;

    @Column({
        type: 'jsonb',
        nullable: true,
        'default': {},
    })
    data?: Partial<ScheduleEntity>;
}
