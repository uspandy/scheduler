import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditScheduleEntity, AuditUserEntity } from './entities/audit.entity';
import { DepartmentEntity } from './entities/department.entity';
import { RoleEntity } from './entities/role.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from './entities/user.entity';
import { DepartmentDatabaseService } from './services/department.service';
import { RoleDatabaseService } from './services/role.service';
import { ScheduleDatabaseService } from './services/schedule.service';
import { UserDatabaseService } from './services/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([
        AuditScheduleEntity,
        AuditUserEntity,
        DepartmentEntity,
        RoleEntity,
        SessionEntity,
        ScheduleEntity,
        UserEntity,
    ])],
    providers: [DepartmentDatabaseService, RoleDatabaseService, ScheduleDatabaseService, UserDatabaseService],
    exports: [DepartmentDatabaseService, RoleDatabaseService, ScheduleDatabaseService, UserDatabaseService],
})
export class DatabaseModule {}
