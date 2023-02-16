import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from 'src/consts';
import { BaseListQueryParams, TimeRangeListQueryParams } from 'src/dto/ListGeneric.dto';
import { countOffset, maskString, normalizeString } from 'src/utils/helpers';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';

import { AuditActionTypeEnum, AuditUserEntity } from '../entities/audit.entity';
import { ScheduleEntity } from '../entities/schedule.entity';
import { UserEntity } from '../entities/user.entity';

interface IDurationByUser {
    userId: string
    totalDuration: number
}

@Injectable()
export class UserDatabaseService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(AuditUserEntity)
        private readonly auditRepository: Repository<AuditUserEntity>,
    ) {}

    private findByIdsAndRoles(userIds: string[], forRoles?: RolesEnum[]): Promise<UserEntity[]> {
        return this.userRepository.find({
            where: {
                id: In(userIds),
                roles: forRoles?.length ?
                    {
                        name: In(forRoles),
                    } :
                    undefined,
            },
            relations: { roles: true, departments: true },
        });
    }

    async findAllByDuration(
        params: TimeRangeListQueryParams,
        forRoles?: RolesEnum[],
    ): Promise<[UserEntity[], number]> {
        const { page, perPage, from, to } = params;
        const query = this.userRepository.createQueryBuilder('user').
            leftJoin(ScheduleEntity, 'schedule', 'user.id = schedule.user_id').
            select('user.id', 'userId').
            addSelect(
                'COALESCE(SUM(schedule.duration_in_hours),0)',
                'totalDuration',
            ).
            where('schedule IS NULL OR schedule.start_date >= :from AND schedule.start_date <= :to', { from, to }).
            groupBy('user.id').
            orderBy('"totalDuration"', 'DESC').
            addOrderBy('user.created_at', 'ASC').
            limit(perPage).
            offset(countOffset(page, perPage));

        const durations: IDurationByUser[] = await query.getRawMany<IDurationByUser>();

        const users = new Map<string, UserEntity>(
            await this.findByIdsAndRoles(durations.map(v => v.userId), forRoles).
                then(usr => usr.map(v => [v.id, v])),
        );

        return Promise.all([
            durations.reduce<UserEntity[]>((result, { userId, totalDuration }) => {
                const user = users.get(userId);
                if (user) {
                    user.totalSchedulesDurationInHoursByPeriod = totalDuration;
                    result.push(user);
                }
                return result;
            }, []),
            query.getCount(),
        ]);
    }

    findAll(params: BaseListQueryParams): Promise<[UserEntity[], number]> {
        const { page, perPage } = params;
        return this.userRepository.findAndCount({
            take: perPage,
            skip: countOffset(page, perPage),
            order: {
                email: 'ASC',
            },
            relations: { roles: true, departments: true },
        });
    }

    findByEmail(email: string, withDeleted = false): Promise<UserEntity | null> {
        return this.userRepository.findOne({
            where: { email: normalizeString(email) },
            relations: { roles: true, departments: true },
            withDeleted,
        });
    }

    findById(id: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { id }, relations: { roles: true, departments: true }});
    }

    create(
        userEntity: Partial<UserEntity>,
        currentUserId?: string,
        auditAction = AuditActionTypeEnum.CREATE,
    ): Promise<UserEntity> {
        return this.userRepository.manager.transaction(async manager => {
            const user = await manager.getRepository(UserEntity).save(this.userRepository.create(userEntity));
            const audit = this.auditRepository.create({
                action: auditAction,
                data: {
                    ...userEntity,
                    password: userEntity?.password ? maskString(userEntity?.password) : undefined,
                    salt: userEntity?.salt ? maskString(userEntity?.salt) : undefined,
                },
                target: user,
                subject: currentUserId ? { id: currentUserId } : user,
            });
            await manager.getRepository(AuditUserEntity).save(audit);
            return user;
        });
    }

    updateWithCascade(
        id: string,
        userEntity: Partial<UserEntity>,
        currentUserId: string,
    ): Promise<UserEntity> {
        return this.create({ ...userEntity, id }, currentUserId, AuditActionTypeEnum.UPDATE);
    }

    update(
        id: string,
        userEntity: Partial<UserEntity>,
    ): Promise<UpdateResult> {
        return this.userRepository.update(id, userEntity);
    }

    delete(id: string): Promise<UpdateResult> {
        return this.userRepository.softDelete(id);
    }

    hardDelete(id: string): Promise<DeleteResult> {
        return this.userRepository.delete(id);
    }

    restore(id: string): Promise<UpdateResult> {
        return this.userRepository.restore(id);
    }
}
