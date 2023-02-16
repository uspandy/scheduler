import {
    Body as BodyDecorator,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RolesEnum } from 'src/consts';
import { GenericResponse } from 'src/dto/GenericResponse.dto';
import { BaseListQueryParams, TimeRangeListQueryParams } from 'src/dto/ListGeneric.dto';
import { UpdateUserForm, UserParams, UserResponse, UsersListResponse } from 'src/dto/User.dto';
import { UserService } from 'src/services/user';

import { AdminAuthGuard, UserAndSession } from '../helpers/guards';
import { baseApiHeadersParams, queryValidationPipe } from '../helpers/helpers';

const userEntityResponseParams = {
    status: 200,
    description: 'User entity',
    type: UserResponse,
};

@ApiHeader(baseApiHeadersParams)
@ApiTags('admin/users')
@UseGuards(AdminAuthGuard)
@Controller('admin/users')
export class AdminUserController {
    constructor(
      private readonly userService: UserService,
    ) {}

    @Get('/schedules-total-duration')
    @ApiOperation({
        summary: 'Get users list with durations',
    })
    @ApiResponse({
        status: 200,
        description: 'Users list with durations',
        type: UsersListResponse,
    })
    async getListWithDurations(
        @Query(queryValidationPipe) queryParams: TimeRangeListQueryParams,
    ): Promise<UsersListResponse> {
        return this.userService.getListWithDurations(queryParams, [RolesEnum.STAFF]);
    }

    @Get()
    @ApiOperation({
        summary: 'Get users list',
    })
    @ApiResponse({
        status: 200,
        description: 'Users list',
        type: UsersListResponse,
    })
    async getList(
        @Query(queryValidationPipe) queryParams: BaseListQueryParams,
    ): Promise<UsersListResponse> {
        return this.userService.getList(queryParams);
    }

    @Patch(':id/activate')
    @ApiOperation({
        summary: 'Activate user',
    })
    @ApiResponse(userEntityResponseParams)
    async activate(
        @UserAndSession('userId') currentUserId: string,
        @Param() userParams: UserParams,
    ): Promise<UserResponse> {
        return this.userService.activate(userParams.id, currentUserId);
    }

    @Patch(':id/block')
    @ApiOperation({
        summary: 'Block user',
    })
    @ApiResponse(userEntityResponseParams)
    async block(
        @UserAndSession('userId') currentUserId: string,
        @Param() userParams: UserParams,
    ): Promise<UserResponse> {
        return this.userService.block(userParams.id, currentUserId);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete user',
    })
    @ApiResponse({
        status: 200,
        description: 'User is deleted (status)',
        type: GenericResponse,
    })
    async delete(
        @UserAndSession('userId') currentUserId: string,
        @Param() userParams: UserParams,
    ): Promise<GenericResponse> {
        return this.userService.delete(userParams.id, currentUserId);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update user',
    })
    @ApiBody({
        type: UpdateUserForm,
        required: true,
    })
    @ApiResponse(userEntityResponseParams)
    async update(
        @Param() userParams: UserParams,
        @UserAndSession('userId') currentUserId: string,
        @BodyDecorator() updateUserForm: UpdateUserForm,
    ): Promise<UserResponse> {
        return this.userService.update(userParams.id, updateUserForm, currentUserId);
    }
}
