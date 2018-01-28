

import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { StringDecoder } from 'string_decoder';
import { Request, Response, NextFunction } from 'express';
import { has } from 'typescript-collections/dist/lib/util';

interface PasswordHash {
    hash: string;
    salt: string;
}

class PasswordGenerator {
    private secret: string;
    private static expirationTime = 60 * 60 * 24 * 7; // 1 week
    public authorize: (req: Request, res: Response, next: NextFunction) => void;

    constructor() {
        if (process.env.JWT_SECRET) {
            this.secret = process.env.JWT_SECRET;
        } else {
            this.secret = 'TestSecret';
            console.warn('No JWT_SECRET enviroment variable found. Using test secret. Do not use this in production.');
        }
        this.authorize = this.needsAuth.bind(this);
    }

    public createUserToken(accountID: number) {
        return this.signJWT({ accountID: accountID });
    }

    public createEmailVerificationToken(accountID: number) {
        return this.signJWT({ accountID: accountID, email: true });
    }

    private needsAuth(req: Request, res: Response, next: NextFunction) {
        try {
            req.user = jwt.verify(req.header('token'), this.secret);
            next();
        } catch (e) {
            res.status(401)
                .send('Requires Authentication');
        }
    }

    private signJWT(payload: string | object | Buffer) {
        return jwt.sign(payload, this.secret, {
            expiresIn: PasswordGenerator.expirationTime
        });
    }

    public genRandomString(length: number) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    };

    public getHashedPassword = (password: string) => {
        const salt = this.genRandomString(32);
        return new Promise<PasswordHash>((fulfill, reject) => {
            crypto.pbkdf2(password, salt, 100000, 128, 'sha512', (err, derivedKey) => {
                if (err) {
                    reject(err);
                    return;
                }
                fulfill({
                    hash: derivedKey.toString('base64'),
                    salt: salt
                });
            });
        });
    };

    public checkPassword = (candidate: string, hash: string, salt: string) => {
        return new Promise((fulfill, reject) => {
            crypto.pbkdf2(candidate, salt, 100000, 128, 'sha512', (err, derivedKey) => {
                if (err) {
                    reject(err);
                    return;
                }
                fulfill(derivedKey.toString('base64') === hash);
            });
        });
    };
}

export const passwords = new PasswordGenerator();