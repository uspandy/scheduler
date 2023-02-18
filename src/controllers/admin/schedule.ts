import {
    Body as BodyDecorator,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
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
import { GenericResponse } from 'src/dto/GenericResponse.dto';
import {
    AdminSchedulesListQueryParams,
    CreateScheduleForm,
    ScheduleParams,
    ScheduleResponse,
    SchedulesListResponse,
    UpdateScheduleForm,
} from 'src/dto/Schedule.dto';
import { ScheduleService } from 'src/services/schedule';

import { AdminAuthGuard } from '../helpers/guards';
import { baseApiHeadersParams, queryValidationPipe } from '../helpers/helpers';

const scheduleEntityResponseParams = {
    status: 200,
    description: 'Schedule entity',
    type: ScheduleResponse,
};

@ApiHeader(baseApiHeadersParams)
@ApiTags('admin/schedule')
@UseGuards(AdminAuthGuard)
@Controller('admin/schedules')
export class AdminScheduleController {
    constructor(
    private readonly scheduleService: ScheduleService,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Create schedule',
    })
    @ApiBody({
        type: CreateScheduleForm,
        required: true,
    })
    @ApiResponse(scheduleEntityResponseParams)
    async create(
        @BodyDecorator() createScheduleForm: CreateScheduleForm,
    ): Promise<ScheduleResponse> {
        return this.scheduleService.create(createScheduleForm);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete schedule',
    })
    @ApiResponse({
        status: 200,
        description: 'Schedule is deleted (status)',
        type: GenericResponse,
    })
    async delete(
        @Param() scheduleParams: ScheduleParams,
    ): Promise<GenericResponse> {
        return this.scheduleService.delete(scheduleParams.id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update schedule',
    })
    @ApiBody({
        type: UpdateScheduleForm,
        required: true,
    })
    @ApiResponse(scheduleEntityResponseParams)
    async update(
        @Param() scheduleParams: ScheduleParams,
        @BodyDecorator() updateScheduleForm: UpdateScheduleForm,
    ): Promise<ScheduleResponse> {
        return this.scheduleService.update(scheduleParams.id, updateScheduleForm);
    }

    @Get()
    @ApiOperation({
        summary: 'Get schedules list (without department restrictions)',
    })
    @ApiResponse({
        status: 200,
        description: 'Schedules list',
        type: SchedulesListResponse,
    })
    async getList(
        @Query(queryValidationPipe) queryParams: AdminSchedulesListQueryParams,
    ): Promise<SchedulesListResponse> {
        return this.scheduleService.getAdminListByUserId(queryParams.userId, queryParams);
    }
}
