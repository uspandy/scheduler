import { BadRequestException, Injectable } from '@nestjs/common';
import { RolesEnum } from 'src/consts';
import { UserEntity, UserStatusEnum } from 'src/db/entities/user.entity';
import { RoleDatabaseService } from 'src/db/services/role.service';
import { UserDatabaseService } from 'src/db/services/user.service';
import { GenericResponse } from 'src/dto/GenericResponse.dto';
import { BaseListQueryParams, TimeRangeListQueryParams } from 'src/dto/ListGeneric.dto';
import { UpdateUserForm, UserResponse, UsersListResponse } from 'src/dto/User.dto';
import { ErrorCodesEnum, UserNotFound } from 'src/logging/errors';
import { createPasswordSalt } from 'src/utils/crypto';
import { countTotalPages } from 'src/utils/helpers';


@Injectable()
export class UserService {
    constructor(
        private readonly userService: UserDatabaseService,
        private readonly roleService: RoleDatabaseService,
    ) {}

    async getListWithDurations(
        queryParams: TimeRangeListQueryParams,
        forRoles?: RolesEnum[],
    ): Promise<UsersListResponse> {
        const { page, perPage } = queryParams;

        const [users, count] = await this.userService.findAllByDuration(queryParams, forRoles);

        return new UsersListResponse({
            totalItems: count,
            itemsPerPage: perPage,
            currentPage: page,
            totalPages: countTotalPages(count, perPage),
            users,
        });
    }

    async getList(queryParams: BaseListQueryParams): Promise<UsersListResponse> {
        const { page, perPage } = queryParams;

        const [users, count] = await this.userService.findAll(queryParams);

        return new UsersListResponse({
            totalItems: count,
            itemsPerPage: perPage,
            currentPage: page,
            totalPages: countTotalPages(count, perPage),
            users,
        });
    }

    async update(id: string, updateUserForm: UpdateUserForm, currentUserId: string): Promise<UserResponse> {
        const user = await this.userService.findById(id);
        if (!user) {
            throw new UserNotFound('id', id);
        }

        const { roles, ...rest } = updateUserForm;

        const userEntity: Partial<UserEntity> = {
            ...rest,
            roles: roles?.length ? await this.roleService.findByNames(roles) : undefined,
        };
        if (
            updateUserForm.status === UserStatusEnum.BLOCKED &&
            user.status !== UserStatusEnum.BLOCKED
        ) {
            // Here you can block all user sessions
            userEntity.blockedAt = new Date();
        }
        if (
            updateUserForm.status === UserStatusEnum.ACTIVE &&
            user.status !== UserStatusEnum.ACTIVE
        ) {
            userEntity.activatedAt = new Date();
        }
        if (updateUserForm.password) {
            const [password, salt] = await createPasswordSalt(updateUserForm.password);
            userEntity.password = password;
            userEntity.salt = salt;
        }
        await this.userService.updateWithCascade(id, userEntity, currentUserId);
        const updatedUser = await this.userService.findById(id);
        if (!updatedUser) {
            throw new UserNotFound('id', id);
        }
        return new UserResponse(updatedUser);
    }

    async block(id: string, currentUserId: string): Promise<UserResponse> {
        return this.update(id, { status: UserStatusEnum.BLOCKED }, currentUserId);
    }

    async activate(id: string, currentUserId: string): Promise<UserResponse> {
        return this.update(id, { status: UserStatusEnum.ACTIVE }, currentUserId);
    }

    async delete(id: string, currentUserId: string): Promise<GenericResponse> {
        if (id === currentUserId) {
            throw new BadRequestException('You can\'t delete yourself');
        }

        const user = await this.userService.findById(id);

        if (!user) {
            throw new UserNotFound('id', id);
        }

        // TODO: add audit
        return this.userService.delete(id).then(() => ({
            isSuccess: true,
        })).catch((error: Error) => ({
            isSuccess: false,
            error: {
                message: error?.message ?? 'Error on user deletion',
                code: ErrorCodesEnum.USER_DELETION,
            },
        }));
    }
}
