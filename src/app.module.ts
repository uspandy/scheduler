import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AdminAuthController } from './controllers/admin/auth';
import { AdminScheduleController } from './controllers/admin/schedule';
import { AdminUserController } from './controllers/admin/user';
import { PublicController } from './controllers/public';
import { StaffAuthController } from './controllers/staff/auth';
import { StaffScheduleController } from './controllers/staff/schedule';
import { DatabaseModule } from './db/db.module';
import { AuditScheduleEntity, AuditUserEntity } from './db/entities/audit.entity';
import { DepartmentEntity } from './db/entities/department.entity';
import { RoleEntity } from './db/entities/role.entity';
import { ScheduleEntity } from './db/entities/schedule.entity';
import { SessionEntity } from './db/entities/session.entity';
import { UserEntity } from './db/entities/user.entity';
import { LoggingInterceptor } from './logging/interceptor';
import { fileErrorsLogsTransport, fileLogsTransport } from './logging/transports';
import { AuthService } from './services/auth';
import { DepartmentService } from './services/department';
import { JwtService } from './services/jwt';
import { ScheduleService } from './services/schedule';
import { SessionService } from './services/session';
import { UserService } from './services/user';


const appModule = {
    imports: [
        ConfigModule.forRoot(),
        WinstonModule.forRoot({
            level: 'debug',
            format: winston.format.combine(
                winston.format.json(),
            ),
            defaultMeta: { service: 'scheduler' },
            transports: [
                new winston.transports.Console({}),
                fileLogsTransport,
                fileErrorsLogsTransport,
            ],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST'),
                port: Number(configService.get<number>('DATABASE_PORT')),
                username: configService.get('DATABASE_USER'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                entities: [
                    AuditScheduleEntity,
                    AuditUserEntity,
                    DepartmentEntity,
                    RoleEntity,
                    SessionEntity,
                    ScheduleEntity,
                    UserEntity,
                ],
                cache: true,
                logging: configService.get('DATABASE_LOG_LEVEL') ?? [],
            }),
            inject: [ConfigService],
        }),
        DatabaseModule,
    ],
    controllers: [
        AdminAuthController,
        AdminScheduleController,
        AdminUserController,
        StaffScheduleController,
        StaffAuthController,
        PublicController,
    ],
    providers:
    [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        AuthService,
        DepartmentService,
        JwtService,
        ScheduleService,
        SessionService,
        UserService,
    ],
};

@Module(appModule)
export class AppModule {}

