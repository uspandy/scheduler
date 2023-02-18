import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { BaseEntityFields } from './baseFields';
import { UserEntity } from './user.entity';

@Entity({ name: 'schedule' })
export class ScheduleEntity extends BaseEntityFields {
    // TODO: Add schedule type + description
    @Index()
    @Column({
        type: 'date',
        name: 'start_date',
    })
    startDate: string;

    @Column({
        type: 'float',
        name: 'duration_in_hours',
    })
    durationInHours: number;

    @Column({
        name: 'user_id',
    })
    userId: string;

    @ManyToOne(() => UserEntity, user => user.id, { cascade: true, nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: UserEntity;
}
