import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { promises } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
    constructor (
        private users: UsersService
    ) {}

    /**
     * Generate a config.
     * @param res HTTP Response.
     * @param key User's key.
     */
    async getConfig (res: Response, key: string) {
        if (key) {
            const user = await this.users.get({ 'user.key': key });
            if (user) {
                res.writeHead(200, {
                    'Content-Disposition': 'attachment; filename="config.sxcu"',
                });
                const config = {
                    Name: 'astral.cool',
                    DestinationType: 'ImageUploader',
                    RequestType: 'POST',
                    RequestURL: 'http://localhost:3000/api/files',
                    FileFormName: 'file',
                    Body: 'MultipartFormData',
                    Headers: {
                        key: user.user.key,
                    },
                };
                res.end(Buffer.from(JSON.stringify(config, null, 4), 'utf8'));
            } else {
                throw new HttpException('Invalid key.', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('Please provide a key.', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get a list of all the domains.
     * @param res HTTP Response.
     */
    async getDomains (res: Response) {
        const file = await promises.readFile(join(__dirname, '../utils', 'domains.json'), 'utf-8');
        res.json(JSON.parse(file));
    }
}
