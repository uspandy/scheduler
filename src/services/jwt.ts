import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
    JsonWebTokenError,
    JwtPayload,
    sign,
    SignOptions,
    TokenExpiredError,
    verify,
    VerifyOptions,
} from 'jsonwebtoken';
import { RolesEnum } from 'src/consts';
import { CONFIG } from 'src/utils/config';
import { readFileWithError } from 'src/utils/file';

const PRIVATE_KEY_PATH_FILE = CONFIG.jwt.privateKeyFilePath;
const PUBLIC_KEY_PATH_FILE = CONFIG.jwt.publicKeyFilePath;

const PRIVATE_KEY = readFileWithError(PRIVATE_KEY_PATH_FILE, 'private jwt key');
const PUBLIC_KEY = readFileWithError(PUBLIC_KEY_PATH_FILE, 'public jwt key');

// You can add here any additional valuable info
export interface ITokenPayload {
    /** List of roles */
    roles?: RolesEnum[]
    /** Session id */
    sid?: string
    type: 'access' | 'refresh'
}

@Injectable()
export class JwtService {
    private readonly privateKey: Buffer;
    private readonly publicKey: Buffer;

    constructor() {
        this.privateKey = PRIVATE_KEY;
        this.publicKey = PUBLIC_KEY;
    }

    get base64PublicKey(): string {
        return this.publicKey.toString('base64');
    }

    async signToken(tokenPayload: ITokenPayload, options: SignOptions): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            sign(tokenPayload, this.privateKey, { algorithm: CONFIG.jwt.algorithm, ...options }, (error, token) => {
                if (error) {
                    reject(error);
                }
                if (token) {
                    resolve(token);
                } else {
                    reject(new Error('Signed token is empty'));
                }
            });
        });
    }

    async verifyToken(signedToken: string, options?: VerifyOptions): Promise<JwtPayload & ITokenPayload> {
        return new Promise<JwtPayload & ITokenPayload>((resolve, reject) => {
            verify(signedToken, this.publicKey, { ...options, algorithms: [CONFIG.jwt.algorithm]}, (error, token) => {
                if (error) {
                    reject(error);
                }
                resolve(token as JwtPayload & ITokenPayload);
            });
        }).catch(e => {
            let message = 'Token verify failed';
            if (e instanceof TokenExpiredError) {
                message = 'Token expired';
            }
            if (e instanceof JsonWebTokenError) {
                message = `Bad token error: ${e.message}`;
            }
            throw new UnauthorizedException(message);
        });
    }
}

