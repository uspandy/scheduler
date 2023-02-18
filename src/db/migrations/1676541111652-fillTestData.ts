import { MigrationInterface, QueryRunner } from "typeorm";

import { RolesEnum } from "../../consts";
import { DepartmentEntity } from "../entities/department.entity";
import { RoleEntity } from "../entities/role.entity";

export class fillTestData1676541111652 implements MigrationInterface {
    name = 'fillTestData1676541111652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.save<RoleEntity>(
            Object.entries(RolesEnum).map(([,v]) => queryRunner.manager.create(RoleEntity, {name: v}))
        );
        // Only for tests
        await queryRunner.manager.save<DepartmentEntity>(
            ['department 1', 'department 2', 'department 3'].map(v => queryRunner.manager.create(DepartmentEntity, {name: v}))
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
