import { Algorithm as JwtAlgorithm } from 'jsonwebtoken';

import { readFileWithError } from './file';

const MINUTE = 60;
const HOUR = 60 * MINUTE;

const configFilePath = './config/config.json';

interface IPbkdf2Settings {
    saltLengthBytes: number
    keyLengthBytes: number
    iterations: number
    digest: string
}

interface ISessionSettings {
    /** Session will be blocked if more time has passed since the last token refresh */
    idleTimeSeconds: number
    /** Session will be blocked if more time has passed since the session creation */
    expirationTimeSeconds: number
}

interface IJwtTokenSettings {
    accessTokenTTLSeconds: number
    refreshTokenTTLSeconds: number
    clockToleranceSeconds: number
    algorithm: JwtAlgorithm
    privateKeyFilePath: string
    publicKeyFilePath: string
}

interface IServiceConfig {
    jwt: IJwtTokenSettings
    pbkdf2: IPbkdf2Settings
    session: ISessionSettings
}

const defaultConfig: IServiceConfig = {
    jwt: {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        accessTokenTTLSeconds: 5 * MINUTE,
        refreshTokenTTLSeconds: 24 * HOUR,
        clockToleranceSeconds: 10,
        algorithm: 'ES512',
        privateKeyFilePath: '',
        publicKeyFilePath: '',
    },
    pbkdf2: {
        saltLengthBytes: 64,
        keyLengthBytes: 64,
        iterations: 358471,
        digest: 'sha3-512',
    },
    session: {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        idleTimeSeconds: 4 * HOUR,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expirationTimeSeconds: 48 * HOUR,
    },
};

function parseConfig(): IServiceConfig {
    let config: IServiceConfig = defaultConfig;

    try {
        const configFile = JSON.parse(readFileWithError(configFilePath, 'project config').toString()) as IServiceConfig;
        config = {
            ...config,
            ...configFile,
        };
    } catch (e: unknown) {
        // eslint-disable-next-line no-console
        console.error(e);
    }

    // eslint-disable-next-line no-console
    console.log(`\n--------------------------- CONFIG (${configFilePath}) ---------------------------`);
    // eslint-disable-next-line no-console
    console.dir(config, { depth: 5 });

    return config;
}

export const CONFIG = parseConfig();
