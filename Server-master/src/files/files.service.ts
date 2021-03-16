import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { existsSync, promises } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { User } from '../users/user.schema';
import { getUploadData, getUploads } from '../utils/environment';
import { WipeDTO } from './dtos/files.dto';
import { File } from './file.schema';

@Injectable()
export class FilesService {
    constructor (
        @InjectModel(File.name) private files: Model<File>,
        @InjectModel(User.name) private users: Model<User>
    ) {}

    /**
     * Query a file.
     * @param query Data to query the file with.
     */
    async get (query: any): Promise<File | null> {
        return await this.files.findOne(query);
    }

    /**
     * Delete a file.
     * @param query File to delete.
     */
    async delete (query: any): Promise<any | null> {
        return await this.files.deleteOne(query);
    }

    /**
     * Create a new file.
     * @param file File info.
     * @param display Display info.
     * @param user User who uploaded the file.
     */
    async create ({ file, display, user }: any): Promise<File | null> {
        return await this.files.create({
            file,
            display,
            user,
        });
    }

    /**
     * Upload a file.
     * @param res HTTP Response.
     * @param req HTTP Request.
     * @param file File to upload.
     */
    async uploadFile (res: Response, req: Request, file: any) {
        if (file) {
            const user = await this.users.findOne({ 'user.key': req.headers.key });
            const data = getUploadData(user, file);
            if (user) {
                await this.create({
                    file: {
                        name: file.filename,
                        originalName: file.originalname,
                        extension: extname(file.originalname),
                        date: new Date().toLocaleDateString(),
                    },
                    display: {
                        type: data.type,
                        embed: {
                            title: user.settings.embed.title,
                            text: user.settings.embed.text,
                            color: user.settings.embed.color,
                        },
                    },
                    user: user.user.username,
                });
                await this.users.updateOne(user, { $inc: { 'stats.uploads': +1 } });
                res.send(data.url);
            }
        } else {
            throw new HttpException('Provide a file.', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Delete a file.
     * @param res HTTP Response.
     * @param req HTTP Request.
     * @param file File to delete.
     */
    async deleteFile (res: Response, req: Request, file: any) {
        if (file) {
            const query = await this.get({ 'file.name': file });
            if (query) {
                const user = await this.users.findOne({ 'user.username': query.user });
                if (user) {
                    const dir = join(__dirname, `../../uploads/${user.user.key}`, query.file.name);
                    if (req.headers.authorization) {
                        if (req.headers.authorization === process.env.API_KEY) {
                            if (existsSync(dir)) {
                                await promises.unlink(dir)
                                    .then(async () => {
                                        await query.remove();
                                        res.json({ success: true, message: 'Deleted file successfully.' });
                                    }).catch((err) => {
                                        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
                                    });
                            } else {
                                throw new HttpException('The specified file does not exist.', HttpStatus.NOT_FOUND);
                            }
                        } else {
                            throw new HttpException('Invalid API-key.', HttpStatus.UNAUTHORIZED);
                        }
                    } else if (req.session && req.session.user) {
                        if (req.session.user.user.username === query.user) {
                            if (existsSync(dir)) {
                                await promises.unlink(dir)
                                    .then(async () => {
                                        await query.remove();
                                        res.json({ success: true, message: 'Deleted file successfully.' });
                                    }).catch((err) => {
                                        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
                                    });
                            } else {
                                throw new HttpException('The specified file does not exist.', HttpStatus.NOT_FOUND);
                            }
                        } else {
                            throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
                        }
                    }
                } else {
                    await query.remove();
                    throw new HttpException('The user attached to this file does not exist.', HttpStatus.NOT_FOUND);
                }
            } else {
                throw new HttpException('Invalid file.', HttpStatus.NOT_FOUND);
            }
        }
    }

    /**
     * Wipe a user's files.
     * @param res HTTP Response.
     * @param req HTTP Request.
     * @param body Request body.
     */
    async wipeFiles (res: Response, req: Request, body: WipeDTO) {
        if (body) {
            if (req.headers.authorization && req.headers.authorization === process.env.API_KEY) {
                const toQuery: any = {};
                for (const entry of Object.entries(body)) {
                    toQuery[`user.${entry[0]}`] = entry[1];
                }
                if (Object.keys(toQuery).length !== 0) {
                    const user = await this.users.findOne(toQuery);
                    if (user) {
                        const dir = join(__dirname, '../../uploads', <string>user.user.key);
                        await promises.rmdir(dir, { recursive: true })
                            .then(async () => {
                                await this.users.updateOne(user, { 'stats.uploads': 0 });
                                res.json({ success: true, message: 'Wiped uploads successfully.' });
                            }).catch((err) => {
                                throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
                            });
                    } else {
                        throw new HttpException('Invalid user.', HttpStatus.NOT_FOUND);
                    }
                } else {
                    throw new HttpException('Invalid request.', HttpStatus.BAD_REQUEST);
                }
            } else if (req.session && req.session.user) {
                const user = await this.users.findOne({ 'user.username': req.session.user.user.username });
                if (user) {
                    const dir = join(__dirname, '../../uploads', <string>user.user.key);
                    await promises.rmdir(dir, { recursive: true })
                        .then(async () => {
                            await this.users.updateOne(user, { 'stats.uploads': 0 });
                            res.json({ success: true, message: 'Wiped uploads successfully.' });
                        }).catch((err) => {
                            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
                        });
                } else {
                    throw new HttpException('Invalid user.', HttpStatus.NOT_FOUND);
                }
            } else {
                throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('Invalid request.', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Wipe a user's files.
     * @param res HTTP Response.
     * @param req HTTP Request.
     * @param body Request body.
     */
    async sendFile (res: Response, fileName: string) {
        const file = await this.files.findOne({ 'file.name': { $regex: new RegExp(fileName) } });
        if (file) {
            const uploads = await getUploads(join(__dirname, '../../', 'uploads'), file.file.name);
            if (uploads.length !== 0) {
                res.json({ success: true, file });
            } else {
                res.json({ success: false, message: 'Invalid file.' });
            } 
        } else {
            res.json({ success: false, message: 'Invalid file.' });
        }
    }

    /**
     * Validate a upload request.
     * @param req HTTP Request.
     */
    async validateUpload (req: Request) {
        if (req.headers.key) {
            const user = await this.users.findOne({ 'user.key': req.headers.key });
            if (user) {
                if (user.user.username === null || user.user.password === null || user.user.discordId === null) {
                    throw new HttpException('The account attached to this key has not been fully registered.', HttpStatus.FORBIDDEN);
                } else {
                    return true;
                }
            } else {
                throw new HttpException('Invalid key.', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('Provide a key.', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Validate a deletion request.
     * @param req HTTP Request.
     */
    async validateDeletion (req: Request) {
        if (req.headers.authorization) {
            if (req.headers.authorization === process.env.API_KEY) {
                return true;
            } else {
                throw new HttpException('Invalid API-key.', HttpStatus.UNAUTHORIZED);
            }
        } else if (req.session && req.session.user) {
            return true;
        } else {
            throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
        }
    }
}
