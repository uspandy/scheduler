import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { BaseEntityFields } from './baseFields';
import { UserEntity } from './user.entity';

export enum SessionStatusEnum {
    /** New session (for third party authentication) */
    CREATED = 'CREATED',
    /** New session that was abandoned (for third party authentication) */
    ABANDONED = 'ABANDONED',
    /** Active sessions */
    ACTIVE = 'ACTIVE',
    /** Expired session */
    EXPIRED = 'EXPIRED',
    /** Blocked session */
    BLOCKED = 'BLOCKED',
}

/*
 * Here you can add additional session information (for example login provider, nonce or codeVerifier for PKCE)
 * Only fields that do not need to be searched!
 */
export interface ISessionData {
    accessToken: {
        jti: string
    }
    refreshToken: {
        jti: string
    }
}

@Entity({ name: 'session' })
export class SessionEntity extends BaseEntityFields {
    @Index()
    @Column({
        type: 'enum',
        'enum': SessionStatusEnum,
        'default': SessionStatusEnum.CREATED,
    })
    status: SessionStatusEnum;

    @Column({
        type: 'jsonb',
        'default': {},
    })
    data: ISessionData;

    @Column({
        type: 'timestamptz',
        name: 'expired_at',
    })
    expiredAt: Date;

    @Column({
        type: 'timestamptz',
        'default': () => 'CURRENT_TIMESTAMP',
        name: 'last_activity_at',
    })
    lastActivityAt: Date;

    @Column({
        name: 'user_id',
    })
    userId: string;

    @ManyToOne(() => UserEntity, user => user.id, { cascade: true, nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: UserEntity;
}
