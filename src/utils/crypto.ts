import * as crypto from 'crypto';

import { CONFIG } from './config';

// PBKDF2 as example
function pbkdf2(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(
            password,
            salt,
            CONFIG.pbkdf2.iterations,
            CONFIG.pbkdf2.keyLengthBytes,
            CONFIG.pbkdf2.digest,
            (err, derivedKey) => {
                if (err) { reject(err); }
                if (derivedKey) { resolve(derivedKey); }
                reject(new Error('Empty derivedKey (pbkdf2)'));
            },
        );
    });
}

export async function createPasswordSalt(
    plainPassword: string,
    algorithm: (password: string, salt: Buffer) => Promise<Buffer> = pbkdf2,
): Promise<[string, string]> {
    const salt = crypto.randomBytes(CONFIG.pbkdf2.saltLengthBytes);
    const hashedPassword = await algorithm(plainPassword.normalize(), salt);
    return [
        hashedPassword.toString('hex'),
        salt.toString('hex'),
    ];
}

export async function validatePassword(
    plainPassword: string,
    hashedPassword: Buffer,
    storedSalt: Buffer,
    algorithm: (password: string, salt: Buffer) => Promise<Buffer> = pbkdf2,
): Promise<boolean> {
    const plainHashedPassword = await algorithm(plainPassword.normalize(), storedSalt);
    return crypto.timingSafeEqual(plainHashedPassword, hashedPassword);
}
