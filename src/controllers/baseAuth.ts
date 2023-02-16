import {
    Body as BodyDecorator,
    Post,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { RolesEnum } from 'src/consts';
import { GenericResponse } from 'src/dto/GenericResponse.dto';
import { LogonForm } from 'src/dto/LogonForm.dto';
import { SignUpForm } from 'src/dto/SignUpForm.dto';
import { RefreshTokenForm, TokenPairResponse } from 'src/dto/Tokens.dto';
import { AuthService } from 'src/services/auth';

export class BaseAuthController {
    constructor(
      readonly forRoles: RolesEnum[],
      readonly authService: AuthService,
    ) {}

    @Post('signup')
    @ApiOperation({
        summary: 'Simple sign up',
    })
    @ApiBody({
        type: SignUpForm,
        required: true,
    })
    @ApiResponse({
        status: 201,
        description: 'User is created (status)',
        type: GenericResponse,
    })
    simpleSignUp(
        @BodyDecorator() signUpForm: SignUpForm,
    ): Promise<GenericResponse> {
        return this.authService.signUp(signUpForm, { roles: this.forRoles });
    }

    @Post('logon')
    @ApiOperation({
        summary: 'Simple logon',
    })
    @ApiBody({
        type: LogonForm,
        required: true,
    })
    @ApiResponse({
        status: 201,
        description: 'Token pair',
        type: TokenPairResponse,
    })
    simpleLogon(
        @BodyDecorator() logonForm: LogonForm,
    ): Promise<TokenPairResponse> {
        return this.authService.logon(logonForm, this.forRoles);
    }

    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh token',
    })
    @ApiBody({
        type: RefreshTokenForm,
        required: true,
    })
    @ApiResponse({
        status: 201,
        description: 'Token pair',
        type: TokenPairResponse,
    })
    refreshToken(
        @BodyDecorator() refreshToken: RefreshTokenForm,
    ): Promise<TokenPairResponse> {
        return this.authService.refresh(refreshToken, this.forRoles);
    }
}
