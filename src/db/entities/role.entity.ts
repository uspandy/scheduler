import {
    Column,
    Entity,
    ManyToMany,
} from 'typeorm';

import { BaseEntityFields, baseVarcharLength } from './baseFields';
import { UserEntity } from './user.entity';

@Entity({ name: 'role' })
export class RoleEntity extends BaseEntityFields {
    @Column({
        type: 'varchar',
        length: baseVarcharLength,
        unique: true,
    })
    name: string;

    @ManyToMany(() => UserEntity, user => user.roles)
    users?: UserEntity[];
}
