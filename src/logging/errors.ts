import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

class EntityNotFound extends NotFoundException {
    constructor(entity: string, criteria: string, value: string) {
        super(`${entity} with ${criteria} '${value}' not found`);
    }
}

export class UserNotFound extends EntityNotFound {
    constructor(criteria: string, value: string) {
        super('User', criteria, value);
    }
}

export class ScheduleNotFound extends EntityNotFound {
    constructor(criteria: string, value: string) {
        super('Schedule', criteria, value);
    }
}

export class WrongRoles extends ForbiddenException {
    constructor(currentRoles: string[], allowedRoles: string[]) {
        super(`User must have one of the following roles: [${allowedRoles.join(',')}]. Current roles: [${currentRoles.join(',')}]`);
    }
}

export class InvalidToken extends UnauthorizedException {
    constructor(message = 'Invalid token') {
        super(message);
    }
}

export class InvalidCredentials extends ForbiddenException {
    constructor(message = 'Invalid credentials') {
        super(message);
    }
}

export enum ErrorCodesEnum {
    USER_CREATION = 'I-DB-001',
    USER_DELETION = 'I-DB-002',
    SCHEDULE_DELETION = 'I-DB-003',
}
