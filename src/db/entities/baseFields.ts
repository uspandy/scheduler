import {
    BeforeInsert,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';

export const baseVarcharLength = 256;

export class BaseEntityFields {
    @PrimaryColumn('uuid')
    id: string;

    @BeforeInsert()
    beforeInsert(): void {
        this.id = v4();
    }

    @CreateDateColumn({
        type: 'timestamptz',
        name: 'created_at',
    })
    createdAt?: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        name: 'updated_at',
    })
    updatedAt?: Date;

    @DeleteDateColumn({
        type: 'timestamptz',
        name: 'deleted_at',
    })
    deletedAt?: Date;
}
