import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtPayload, VerifyOptions } from 'jsonwebtoken';
import { AudienceEnum, RolesEnum } from 'src/consts';
import { validateRoles } from 'src/services/helpers';
import { ITokenPayload, JwtService } from 'src/services/jwt';
import { SessionService } from 'src/services/session';

const userAndSessionPayloadFieldName = 'userAndSession';

export interface IUserAndSession {
    userId?: string
    sessionId?: string
}

export type ExpressRequestWithPayload =
    // eslint-disable-next-line @typescript-eslint/no-type-alias
    ExpressRequest & { [userAndSessionPayloadFieldName]: IUserAndSession | undefined };

function getAndVerifyTokenFromHeader(
    jwtService: JwtService,
    request: ExpressRequest,
    verifyOptions?: VerifyOptions,
): Promise<JwtPayload & ITokenPayload | undefined> {
    const [,authorization] = request.headers.authorization?.split(' ') ?? [];

    // Here you can add additional sources of token (cookies as example)

    if (authorization) {
        return jwtService.verifyToken(authorization, verifyOptions);
    }

    return Promise.resolve(undefined);
}

async function baseCanActivate(
    jwtService: JwtService,
    sessionService: SessionService,
    context: ExecutionContext,
    verifyOptions?: VerifyOptions,
    allowedRoles?: RolesEnum[],
): Promise<boolean> {
    const request: ExpressRequestWithPayload = context.switchToHttp().getRequest();
    const token = await getAndVerifyTokenFromHeader(jwtService, request, verifyOptions);

    if (token) {
        // Here you can make additional actions with token payload
        const { sub, sid, jti, roles } = token;
        await sessionService.validateUserAndSession(sid, jti, sub);
        if (allowedRoles?.length && roles) {
            validateRoles(roles, allowedRoles);
        }
        request[userAndSessionPayloadFieldName] = {
            userId: sub,
            sessionId: sid,
        };
    }

    return !!token;
}

export const UserAndSession = createParamDecorator(
    (field: keyof IUserAndSession, context: ExecutionContext) => {
        const request: ExpressRequestWithPayload = context.switchToHttp().getRequest();
        const payload = request[userAndSessionPayloadFieldName];
        return field ? payload?.[field] : payload;
    },
);

@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        return baseCanActivate(this.jwtService, this.sessionService, context, {
            audience: AudienceEnum.BACKOFFICE,
        }, [
            RolesEnum.ADMIN,
        ]);
    }
}

@Injectable()
export class StaffMemberAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        return baseCanActivate(this.jwtService, this.sessionService, context, {
            audience: AudienceEnum.BACKOFFICE,
        }, [
            RolesEnum.STAFF,
        ]);
    }
}
