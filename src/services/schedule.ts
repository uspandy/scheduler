import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { RolesEnum } from 'src/consts';
import { ScheduleEntity } from 'src/db/entities/schedule.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { ScheduleDatabaseService } from 'src/db/services/schedule.service';
import { UserDatabaseService } from 'src/db/services/user.service';
import { GenericResponse } from 'src/dto/GenericResponse.dto';
import { TimeRangeListQueryParams } from 'src/dto/ListGeneric.dto';
import {
    CreateScheduleForm,
    ScheduleResponse,
    SchedulesListResponse,
    StaffSchedulesListQueryParams,
    UpdateScheduleForm,
} from 'src/dto/Schedule.dto';
import { ErrorCodesEnum, ScheduleNotFound, UserNotFound } from 'src/logging/errors';
import { countTotalPages, isIntersect, normalizeDate } from 'src/utils/helpers';

import { validateRoles, validateUserIsActive } from './helpers';


@Injectable()
export class ScheduleService {
    constructor(
        private readonly scheduleService: ScheduleDatabaseService,
        private readonly userService: UserDatabaseService,
    ) {}

    async getAdminListByUserId(
        userId: string,
        queryParams: TimeRangeListQueryParams,
    ): Promise<SchedulesListResponse> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UserNotFound('id', userId);
        }
        return this.getListByUserId(userId, queryParams);
    }

    async getStaffListByUserId(
        queryParams: StaffSchedulesListQueryParams,
        currentUserId: string,
    ): Promise<SchedulesListResponse> {
        const { userId: paramUserId } = queryParams;

        if (!paramUserId) {
            return this.getAdminListByUserId(currentUserId, queryParams);
        }

        const targetUser = await this.userService.findById(paramUserId);
        if (!targetUser) {
            throw new UserNotFound('id', paramUserId);
        }

        const currentUserDepartmentIds = (await this.userService.findById(currentUserId))?.
            departments?.map(v => v.id) ?? [];
        const targetUserDepartmentIds = targetUser.departments?.map(v => v.id) ?? [];

        if (!isIntersect(currentUserDepartmentIds, targetUserDepartmentIds)) {
            throw new ForbiddenException('You can\'t get schedules for user in different departments');
        }

        return this.getListByUserId(paramUserId, queryParams);
    }

    private async getListByUserId(
        userId: string,
        queryParams: TimeRangeListQueryParams,
    ): Promise<SchedulesListResponse> {
        const { page, perPage } = queryParams;

        const [schedules, count] = await this.scheduleService.findAllByUserId(userId, queryParams);

        return new SchedulesListResponse({
            totalItems: count,
            itemsPerPage: perPage,
            currentPage: page,
            totalPages: countTotalPages(count, perPage),
            schedules,
        });
    }

    async create(createScheduleForm: CreateScheduleForm): Promise<ScheduleResponse> {
        const { userId, startDate } = createScheduleForm;

        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UserNotFound('id', userId);
        }
        validateUserIsActive(user);
        // Only user with role staff can have schedules
        validateRoles((user.roles ?? []).map(v => v.name), [RolesEnum.STAFF]);

        const existSchedule = await this.scheduleService.findByUserIdAndStartDate(userId, startDate);
        if (existSchedule) {
            throw new BadRequestException('Schedule for this user at this date already exists');
        }

        return new ScheduleResponse(await this.scheduleService.create({
            ...createScheduleForm,
            user,
            startDate: normalizeDate(startDate),
        }));
    }

    async update(id: string, updateScheduleForm: UpdateScheduleForm): Promise<ScheduleResponse> {
        const schedule = await this.scheduleService.findById(id);

        if (schedule) {
            const { userId: newUserId, startDate } = updateScheduleForm;

            let newUser: UserEntity | null = null;
            if (newUserId && newUserId !== schedule.userId) {
                const user = await this.userService.findById(newUserId);
                if (!user) {
                    throw new UserNotFound('id', newUserId);
                }
                validateUserIsActive(user);
                // Only user with role staff can have schedules
                validateRoles((user.roles ?? []).map(v => v.name), [RolesEnum.STAFF]);
                newUser = user;
            }

            const scheduleEntity: Partial<ScheduleEntity> = {
                ...updateScheduleForm,
                startDate: startDate ? normalizeDate(startDate) : undefined,
                user: newUser ?? undefined,
            };

            await this.scheduleService.update(id, scheduleEntity);

            const updatedSchedule = await this.scheduleService.findById(id);
            if (updatedSchedule) {
                return new ScheduleResponse(updatedSchedule);
            }
        }
        throw new ScheduleNotFound('id', id);
    }

    async delete(id: string): Promise<GenericResponse> {
        const schedule = await this.scheduleService.findById(id);

        if (!schedule) {
            throw new ScheduleNotFound('id', id);
        }

        return this.scheduleService.delete(id).then(() => ({
            isSuccess: true,
        })).catch((error: Error) => ({
            isSuccess: false,
            error: {
                message: error?.message ?? 'Error on schedule deletion',
                code: ErrorCodesEnum.SCHEDULE_DELETION,
            },
        }));
    }
}
