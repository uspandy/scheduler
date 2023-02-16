import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { ScheduleEntity } from 'src/db/entities/schedule.entity';
import { SeparatorPositionISO8601 } from 'src/utils/helpers';

import { ListResponse, TimeRangeListQueryParams } from './ListGeneric.dto';
import { userIdParams } from './User.dto';

const idParams = {
    description: 'Schedule id',
};

const createdAtParams = {
    description: 'Schedule created at (ISO string)',
};

const updatedAtParams = {
    description: 'Schedule last updated at (ISO string)',
};

const startDateParams = {
    description: 'Schedule start date (date part of ISO string)',
    maxLength: SeparatorPositionISO8601,
    minLength: SeparatorPositionISO8601,
};

const durationInHoursParams = {
    description: 'Schedule duration in hours',
    minimum: 0,
    maximum: 24,
};

export class ScheduleResponse {
    @ApiProperty(idParams)
    id: string;

    @ApiProperty(durationInHoursParams)
    durationInHours: number;

    @ApiProperty(startDateParams)
    startDate: string;

    @ApiProperty(userIdParams)
    userId: string;

    @ApiPropertyOptional(createdAtParams)
    createdAt?: string;

    @ApiPropertyOptional(updatedAtParams)
    updatedAt?: string;

    constructor(v?: ScheduleResponse | ScheduleEntity) {
        if (v) {
            this.id = v.id;
            this.userId = v.userId;
            this.durationInHours = v.durationInHours;
            this.startDate = v.startDate;
            this.createdAt = typeof v.createdAt === 'string' ? v.createdAt : v.createdAt?.toISOString();
            this.updatedAt = typeof v.updatedAt === 'string' ? v.updatedAt : v.updatedAt?.toISOString();
        }
    }
}

export class UpdateScheduleForm {
    @ApiPropertyOptional(durationInHoursParams)
    @IsOptional()
    @IsNumber()
    @Min(durationInHoursParams.minimum)
    @Max(durationInHoursParams.maximum)
    durationInHours?: number;

    @ApiPropertyOptional(startDateParams)
    @IsOptional()
    @IsString()
    @IsISO8601({ strict: true })
    @Length(startDateParams.minLength, startDateParams.maxLength)
    startDate?: string;

    @ApiPropertyOptional(userIdParams)
    @IsOptional()
    @IsString()
    @IsUUID('4')
    userId?: string;

    constructor(v?: UpdateScheduleForm) {
        if (v) {
            this.durationInHours = v.durationInHours;
            this.startDate = v.startDate;
            this.userId = v.userId;
        }
    }
}

export class CreateScheduleForm {
    @ApiProperty(durationInHoursParams)
    @IsNotEmpty()
    @IsNumber()
    @Min(durationInHoursParams.minimum)
    @Max(durationInHoursParams.maximum)
    durationInHours: number;

    @ApiProperty(startDateParams)
    @IsNotEmpty()
    @IsString()
    @IsISO8601({ strict: true })
    @Length(startDateParams.minLength, startDateParams.maxLength)
    startDate: string;

    @ApiProperty(userIdParams)
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    userId: string;

    // eslint-disable-next-line sonarjs/no-identical-functions
    constructor(v?: CreateScheduleForm) {
        if (v) {
            this.durationInHours = v.durationInHours;
            this.startDate = v.startDate;
            this.userId = v.userId;
        }
    }
}

export class SchedulesListResponse extends ListResponse {
    @ApiProperty({
        description: 'Schedules list',
        isArray: true,
        type: ScheduleResponse,
    })
    schedules: (ScheduleResponse | ScheduleEntity)[];

    constructor(v?: SchedulesListResponse) {
        super(v);
        if (v) {
            this.schedules = (v.schedules ?? []).map(x => new ScheduleResponse(x));
        }
    }
}

export class ScheduleParams {
    @ApiProperty(idParams)
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    id: string;

    constructor(v?: ScheduleParams) {
        if (v) {
            this.id = v.id;
        }
    }
}

export class StaffSchedulesListQueryParams extends TimeRangeListQueryParams {
    @ApiPropertyOptional(userIdParams)
    @IsOptional()
    @IsString()
    @IsUUID('4')
    userId?: string;

    constructor(v?: StaffSchedulesListQueryParams) {
        super(v);
        if (v) {
            this.userId = v.userId;
        }
    }
}

export class AdminSchedulesListQueryParams extends TimeRangeListQueryParams {
    @ApiProperty(userIdParams)
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    userId: string;

    // eslint-disable-next-line sonarjs/no-identical-functions
    constructor(v?: AdminSchedulesListQueryParams) {
        super(v);
        if (v) {
            this.userId = v.userId;
        }
    }
}
