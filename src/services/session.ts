import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/db/entities/user.entity';
import { UserDatabaseService } from 'src/db/services/user.service';
import { UserNotFound } from 'src/logging/errors';
import { validate as isUUID } from 'uuid';

import { validateUserIsActive } from './helpers';

@Injectable()
export class SessionService {
    constructor(
        private readonly userService: UserDatabaseService,
    ) {}

    async validateUserAndSession(sessionId?: string, jwtId?: string, userId?: string): Promise<UserEntity> {
        // TODO: Add sid and jti validation (via session storage)

        if (!userId || !isUUID(userId)) {
            throw new BadRequestException(`User id '${userId ?? ''}' invalid`);
        }

        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UserNotFound('id', userId);
        }
        validateUserIsActive(user);

        return user;
    }
}
