import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsArray,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Length,
} from 'class-validator';
import { RolesEnum } from 'src/consts';
import { UserEntity, UserStatusEnum } from 'src/db/entities/user.entity';
import { mapToEnum } from 'src/utils/helpers';

import { ListResponse } from './ListGeneric.dto';

export const passwordParams = {
    description: 'User password',
    minLength: 8,
    maxLength: 255,
};

export const emailParams = {
    description: 'User email',
};

export const userIdParams = {
    description: 'User id',
};

const rolesParams = {
    description: 'User roles',
    'enum': RolesEnum,
    enumName: 'RolesEnum',
    isArray: true,
};

const statusParams = {
    description: 'User status',
    'enum': UserStatusEnum,
    enumName: 'UserStatusEnum',
};

export const departmentIdParams = {
    description: 'User department id',
};

const createdAtParams = {
    description: 'User created at (ISO string)',
};

const updatedAtParams = {
    description: 'User last updated at (ISO string)',
};

const blockedAtParams = {
    description: 'User last blocked at (ISO string)',
};

const lastLogonAtParams = {
    description: 'User last logon at (ISO string)',
};

const totalSchedulesDurationInHoursByPeriodParams = {
    description: 'Total schedules duration in hours by selected period',
};

export class UpdateUserForm {
  @ApiPropertyOptional(passwordParams)
  @IsOptional()
  @IsString()
  @Length(passwordParams.minLength, passwordParams.maxLength)
  password?: string;

  @ApiPropertyOptional(emailParams)
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional(rolesParams)
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(RolesEnum, { each: true })
  roles?: RolesEnum[];

  @ApiPropertyOptional(statusParams)
  @IsOptional()
  @IsEnum(UserStatusEnum)
  status?: UserStatusEnum;

  @ApiPropertyOptional(departmentIdParams)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  departmentIds?: string[];

  constructor(v?: UpdateUserForm) {
      if (v) {
          this.password = v.password;
          this.email = v.email;
          this.roles = v.roles?.slice();
          this.status = v.status;
          this.departmentIds = v.departmentIds?.slice();
      }
  }
}

export class UserResponse {
    @ApiProperty(userIdParams)
    id: string;

    @ApiProperty(emailParams)
    email: string;

    @ApiProperty(rolesParams)
    roles: RolesEnum[];

    @ApiProperty(statusParams)
    status: UserStatusEnum;

    @ApiPropertyOptional(createdAtParams)
    createdAt?: string;

    @ApiPropertyOptional(updatedAtParams)
    updatedAt?: string;

    @ApiPropertyOptional(blockedAtParams)
    blockedAt?: string;

    @ApiPropertyOptional(lastLogonAtParams)
    lastLogonAt?: string;

    @ApiPropertyOptional(totalSchedulesDurationInHoursByPeriodParams)
    totalSchedulesDurationInHoursByPeriod?: number;

    constructor(v?: UserResponse | UserEntity) {
        if (v) {
            this.id = v.id;
            this.email = v.email;
            this.roles = mapToEnum(RolesEnum, (v.roles ?? []).map(x => typeof x === 'string' ? x : x.name));
            this.status = v.status;
            this.createdAt = typeof v.createdAt === 'string' ? v.createdAt : v.createdAt?.toISOString();
            this.updatedAt = typeof v.updatedAt === 'string' ? v.updatedAt : v.updatedAt?.toISOString();
            this.blockedAt = typeof v.blockedAt === 'string' ? v.blockedAt : v.blockedAt?.toISOString();
            this.lastLogonAt = typeof v.lastLogonAt === 'string' ? v.lastLogonAt : v.lastLogonAt?.toISOString();
            this.totalSchedulesDurationInHoursByPeriod = v.totalSchedulesDurationInHoursByPeriod;
        }
    }
}

export class UsersListResponse extends ListResponse {
    @ApiProperty({
        description: 'Users list',
        isArray: true,
        type: UserResponse,
    })
    users: (UserResponse | UserEntity)[];

    constructor(v?: UsersListResponse) {
        super(v);
        if (v) {
            this.users = (v.users ?? []).map(x => new UserResponse(x));
        }
    }
}

export class UserParams {
    @ApiProperty(userIdParams)
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    id: string;

    constructor(v?: UserParams) {
        if (v) {
            this.id = v.id;
        }
    }
}


