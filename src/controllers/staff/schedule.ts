import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { SchedulesListResponse, StaffSchedulesListQueryParams } from 'src/dto/Schedule.dto';
import { ScheduleService } from 'src/services/schedule';

import { StaffMemberAuthGuard, UserAndSession } from '../helpers/guards';
import { baseApiHeadersParams, queryValidationPipe } from '../helpers/helpers';

@ApiHeader(baseApiHeadersParams)
@ApiTags('staff/schedule')
@UseGuards(StaffMemberAuthGuard)
@Controller('staff/schedules')
export class StaffScheduleController {
    constructor(
    private readonly scheduleService: ScheduleService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Get schedules list (with department restrictions)',
    })
    @ApiResponse({
        status: 200,
        description: 'Schedules list',
        type: SchedulesListResponse,
    })
    async getList(
        @UserAndSession('userId') currentUserId: string,
        @Query(queryValidationPipe) queryParams: StaffSchedulesListQueryParams,
    ): Promise<SchedulesListResponse> {
        return this.scheduleService.getStaffListByUserId(queryParams, currentUserId);
    }
}
