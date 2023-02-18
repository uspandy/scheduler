import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesEnum } from './consts';
import { UserStatusEnum } from './db/entities/user.entity';
import { AuthService } from './services/auth';
import { UserService } from './services/user';

async function createDefaultAdmin(app: INestApplication): Promise<void> {
    const configService = app.get(ConfigService);

    if (configService.get<string>('CREATE_DEFAULT_ADMIN') !== 'true') {
        return;
    }

    const email = configService.get<string>('DEFAULT_ADMIN_EMAIL');
    const password = configService.get<string>('DEFAULT_ADMIN_PASSWORD');

    if (email && password) {
        // eslint-disable-next-line no-console
        console.log('Creating default admin...');
        const user = await app.get(AuthService).signUpWithUserResponse({ email, password });
        if (user) {
            await app.get(UserService).update(
                user.id,
                { status: UserStatusEnum.ACTIVE, roles: [RolesEnum.ADMIN]},
                user.id,
            );
        }
        // eslint-disable-next-line no-console
        console.log('Default admin is created.');
    }
}

export async function onAppInit(app: INestApplication): Promise<void> {
    await createDefaultAdmin(app).catch((e: Error) => {
        // eslint-disable-next-line no-console
        console.log(`Default admin creation error: ${e.message}`);
    });
}
