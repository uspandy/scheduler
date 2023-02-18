import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

const refreshTokenParams = {
    description: 'Refresh token',
};

export class RefreshTokenForm {
    @ApiProperty(refreshTokenParams)
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    constructor(v?: RefreshTokenForm) {
        if (v) {
            this.refreshToken = v.refreshToken;
        }
    }
}

export class TokenPairResponse {
    @ApiProperty({
        description: 'Access token',
    })
    accessToken: string;

    @ApiPropertyOptional(refreshTokenParams)
    refreshToken?: string;

    constructor(v?: TokenPairResponse) {
        if (v) {
            this.accessToken = v.accessToken;
            this.refreshToken = v.refreshToken;
        }
    }
}
