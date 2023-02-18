import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SignOptions } from 'jsonwebtoken';
import { AudienceEnum, RolesEnum } from 'src/consts';
import { UserEntity, UserStatusEnum } from 'src/db/entities/user.entity';
import { DepartmentDatabaseService } from 'src/db/services/department.service';
import { RoleDatabaseService } from 'src/db/services/role.service';
import { UserDatabaseService } from 'src/db/services/user.service';
import { GenericResponse } from 'src/dto/GenericResponse.dto';
import { LogonForm } from 'src/dto/LogonForm.dto';
import { SignUpForm } from 'src/dto/SignUpForm.dto';
import { RefreshTokenForm, TokenPairResponse } from 'src/dto/Tokens.dto';
import { UpdateUserForm } from 'src/dto/User.dto';
import { ErrorCodesEnum, InvalidCredentials, InvalidToken } from 'src/logging/errors';
import { CONFIG } from 'src/utils/config';
import { createPasswordSalt, validatePassword } from 'src/utils/crypto';
import { mapToEnum, normalizeString } from 'src/utils/helpers';
import { v4 as uuid } from 'uuid';

import { validateRoles, validateUserIsActive } from './helpers';
import { ITokenPayload, JwtService } from './jwt';
import { SessionService } from './session';

// eslint-disable-next-line @typescript-eslint/no-type-alias
type SignUpInternalFields = Pick<UpdateUserForm, 'roles' | 'status'>;

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserDatabaseService,
        private readonly departmentService: DepartmentDatabaseService,
        private readonly roleService: RoleDatabaseService,
        private readonly sessionService: SessionService,
    ) {}

    private async generateTokenPair(user: UserEntity, sessionId: string): Promise<TokenPairResponse> {
        const baseSignOptions: SignOptions = {
            audience: AudienceEnum.BACKOFFICE,
            issuer: AudienceEnum.SCHEDULER,
            subject: user.id,
        };

        const accessTokenPayload: ITokenPayload = {
            type: 'access',
            sid: sessionId,
            roles: mapToEnum(RolesEnum, (user.roles ?? []).map(v => v.name)),
        };

        const refreshTokenPayload: ITokenPayload = {
            ...accessTokenPayload,
            type: 'refresh',
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signToken(accessTokenPayload, {
                ...baseSignOptions,
                // You can use jti to ott mechanism in session storage, now it's stub
                jwtid: uuid(),
                expiresIn: CONFIG.jwt.accessTokenTTLSeconds,
                notBefore: -CONFIG.jwt.clockToleranceSeconds,
            }),
            this.jwtService.signToken(refreshTokenPayload, {
                ...baseSignOptions,
                // You can use jti to ott mechanism in session storage, now it's stub
                jwtid: uuid(),
                expiresIn: CONFIG.jwt.refreshTokenTTLSeconds,
                notBefore: -CONFIG.jwt.clockToleranceSeconds,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async signUpWithUserResponse(
        signUpForm: SignUpForm,
        internalFields?: SignUpInternalFields,
    ): Promise<UserEntity | undefined> {
        const user = await this.userService.findByEmail(signUpForm.email, true);
        if (user) {
            if (user.deletedAt) {
                await this.userService.restore(user.id);
            } else {
                throw new BadRequestException(`User with email '${signUpForm.email}' already exists`);
            }
        }

        const { departmentIds, ...filteredForm } = signUpForm;

        const { roles, status } = { status: UserStatusEnum.NOT_ACTIVATED, ...internalFields };

        const [password, salt] = await createPasswordSalt(signUpForm.password);

        return this.userService.create({
            ...filteredForm,
            id: user?.id,
            departments: departmentIds?.length ? await this.departmentService.findByIds(departmentIds) : undefined,
            roles: roles?.length ? await this.roleService.findByNames(roles) : undefined,
            status,
            email: normalizeString(signUpForm.email),
            password,
            salt,
        });
    }

    async signUp(signUpForm: SignUpForm, internalFields?: SignUpInternalFields): Promise<GenericResponse> {
        return this.signUpWithUserResponse(signUpForm, internalFields).then(() => new GenericResponse({
            isSuccess: true,
        })).catch((error: Error) => new GenericResponse({
            isSuccess: false,
            error: {
                message: error?.message ?? 'Error on user creation',
                code: ErrorCodesEnum.USER_CREATION,
            },
        }));
    }

    async logon(logonForm: LogonForm, forRoles?: RolesEnum[]): Promise<TokenPairResponse> {
        const user = await this.userService.findByEmail(logonForm.email);

        if (user) {
            if (forRoles) {
                validateRoles((user.roles ?? []).map(v => v.name), forRoles);
            }
            validateUserIsActive(user);
            if (!user.password) {
                throw new InternalServerErrorException(
                    `Password fields in database record for email '${logonForm.email}' is corrupted`,
                );
            }
            const isPasswordValid = await validatePassword(
                logonForm.password,
                Buffer.from(user.password, 'hex'),
                Buffer.from(user.salt, 'hex'),
            );

            if (!isPasswordValid) {
                throw new InvalidCredentials();
            }
            await this.userService.update(user.id, { lastLogonAt: new Date() });

            // Here you can make additional actions with user (create session, invalidate old sessions, etc)
            const sessionId = uuid();

            return this.generateTokenPair(user, sessionId);
        }

        // Looks like we can throw 404 because user not found, but invalid credentials is more secure
        throw new InvalidCredentials();
    }

    async refresh(refreshTokenForm: RefreshTokenForm, forRoles?: RolesEnum[]): Promise<TokenPairResponse> {
        const { sub, type, sid, jti, roles } = await this.jwtService.verifyToken(refreshTokenForm.refreshToken, {
            clockTolerance: CONFIG.jwt.clockToleranceSeconds,
            issuer: AudienceEnum.SCHEDULER,
        });

        if (type === 'refresh') {
            if (roles && forRoles) {
                validateRoles(roles, forRoles);
            }
            const user = await this.sessionService.validateUserAndSession(sid, jti, sub);
            validateRoles((user.roles ?? []).map(v => v.name), roles ?? []);
            // Session is stub
            const sessionId = sid ?? uuid();
            return this.generateTokenPair(user, sessionId);
        }

        throw new InvalidToken();
    }
}
