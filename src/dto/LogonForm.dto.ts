import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

import { emailParams, passwordParams } from './User.dto';

// You can add to this class any additional properties, like domain or fingerprint
export class LogonForm {
    @ApiProperty(emailParams)
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty(passwordParams)
    @IsNotEmpty()
    @IsString()
    @Length(passwordParams.minLength, passwordParams.maxLength)
    password: string;

    constructor(v?: LogonForm) {
        if (v) {
            this.password = v.password;
            this.email = v.email;
        }
    }
}
