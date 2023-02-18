import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

import { LogonForm } from './LogonForm.dto';
import { departmentIdParams } from './User.dto';

// You can add to this class any additional properties, like additional user info (name, phone, etc) or fingerprint
export class SignUpForm extends LogonForm {
    @ApiPropertyOptional(departmentIdParams)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsUUID('4', { each: true })
    departmentIds?: string[];

    constructor(v?: SignUpForm) {
        super(v);
        if (v) {
            this.departmentIds = v.departmentIds?.slice();
        }
    }
}
