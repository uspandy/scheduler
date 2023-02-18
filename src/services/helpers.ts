import { ForbiddenException } from '@nestjs/common';
import { RolesEnum } from 'src/consts';
import { UserEntity, UserStatusEnum } from 'src/db/entities/user.entity';
import { WrongRoles } from 'src/logging/errors';
import { isIntersect, mapToEnum } from 'src/utils/helpers';

export function validateUserIsActive(user: UserEntity): void {
    if (user.status === UserStatusEnum.BLOCKED) {
        throw new ForbiddenException('User is blocked');
    }
    if (user.status === UserStatusEnum.NOT_ACTIVATED) {
        throw new ForbiddenException('User is not activated');
    }
}

export function validateRoles(currentRoles: string[], allowedRoles: RolesEnum[]): void {
    const currentRolesAsEnum = mapToEnum(RolesEnum, currentRoles);
    if (!isIntersect(currentRolesAsEnum, allowedRoles)) {
        throw new WrongRoles(currentRoles, allowedRoles);
    }
}
