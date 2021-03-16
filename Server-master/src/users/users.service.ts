import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { generateInvite } from '../utils/environment';
import { DeleteDTO } from './dtos/users.dto';
import { User } from './user.schema';

@Injectable()
export class UsersService {
    constructor (
        @InjectModel(User.name) private users: Model<User>
    ) {}

    /**
     * Find all the users.
     */
    async getAll () {
        return await this.users.find();
    }

    /**
     * Query a user.
     * @param query Data to query the user with.
     */
    async get (query: any) {
        return await this.users.findOne(query);
    }

    /**
     * Update a user.
     * @param query User to update.
     * @param data Data to update.
     */
    async update (query: any, data: any) {
        return await this.users.updateOne(query, data);
    }

    /**
     * Delete a user.
     * @param res HTTP Response.
     * @param query Query.
     */
    async delete (res: Response, query: DeleteDTO) {
        if (query && (query.username || query.invite || query.key)) {
            const toQuery: any = {};
            for (const entry of Object.entries(query)) {
                toQuery[`user.${entry[0]}`] = entry[1];
            }
            const user = await this.get(toQuery);
            if (user) {
                await user.remove()
                    .then(() => {
                        res.json({ success: true, message: 'Deleted user successfully.' });
                    }).catch((err: any) => {
                        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
                    });
            } else {
                throw new HttpException('Invalid user.', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Provide a query.', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Generate invites.
     * @param res HTTP Response.
     * @param data Data, specifically the amount.
     */
    async create (res: Response, data: any) {
        const { amount, invitedBy } = data;
        const invites = [];
        for (let i = 0; i < amount; i++) {
            const invite = generateInvite();
            if (invitedBy) {
                const user = await this.users.findOne({ 'user.username': invitedBy });
                if (user) {
                    await this.users.updateOne({ 'user.invite': user.user.invite }, {
                        $push: {
                            'stats.createdInvites': invite,
                        },
                    });
                }
            }
            invites.push(invite);
            await this.insert(invite, invitedBy);
        }
        res.json(invites);
    }

    /**
     * Insert a new user.
     * @param invite Invite code to insert the user with.
     */
    async insert (invite: string, invitedBy = 'Unknown') {
        return await this.users.create({
            user: {
                username: null,
                password: null,
                discordId: null,
                discordAvatar: null,
                invite,
                key: null,
            },
            stats: {
                uploads: 0,
                invites: 0,
                invitedBy,
                createdInvites: [],
                invitedUsers: [],
                registrationDate: null,
            },
            settings: {
                domain: { name: 'astral.cool', subdomain: null },
                showLink: false,
                fakeLink: {
                    enabled: false,
                    link: null,
                },
                embed: {
                    enabled: false,
                    color: null,
                    title: null,
                    text: null,
                },
            },
        });
    }

    /**
     * Get the current user.
     * @param res HTTP Response.
     * @param session The user's session.
     */
    async getMe (res: Response, session: any) {
        if (session.user) {
            const user = await this.users.findOne({ 'user.username': session.user.user.username });
            delete user.user.password;
            delete user.stats.createdInvites;
            res.json(user);
        } else {
            throw new HttpException('Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a user.
     * @param res HTTP Response.
     * @param user
     */
    async getUser (res: Response, user: string) {
        if (user) {
            const findUser = await this.get({ 'user.username': user });
            if (findUser) {
                delete findUser.user.password;
                res.json(findUser);
            } else {
                throw new HttpException('Invalid user.', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Provide a user.', HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get the amount of users.
     * @param res HTTP Response.
     */
    async countUsers (res: Response) {
        const count = await this.users.countDocuments();
        res.json(count);
    }

    /**
     * Update a user.
     * @param res HTTP Response
     * @param session User's session.
     * @param body Request body.
     */
    async updateUser(res: Response, session: any, body: any) {
        const user = await this.users.findOne({ 'user.username': session.user.user.username });
        if (user) {
            const { request, type, domain, subdomain } = body;
            if (request === 'changeDomain') {
                if (type === 'normal') {
                    await this.users.updateOne(user, {
                        'settings.domain.name': domain.name,
                        'settings.domain.subdomain': null,
                    }).then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
                } else if (type === 'wildcard') {
                    await this.users.updateOne(user, {
                        'settings.domain.name': domain.name,
                        'settings.domain.subdomain': subdomain,
                    }).then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
                }
            } else if (request === 'toggleShowlink') {
                const { toggle } = body;
                await this.users.updateOne(user, {
                    'settings.showLink': toggle,
                }).then(() => {
                    res.json({ success: true });
                }).catch((err) => {
                    res.json({ success: false, message: err.message });
                });
            } else if (request === 'toggleFakelink') {
                const { toggle, link } = body;
                if (toggle) {
                    await this.users.updateOne(user, {
                        'settings.fakeLink.enabled': true,
                        'settings.fakeLink.link': link,
                    }).then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
                } else {
                    await this.users.updateOne(user, {
                        'settings.fakeLink.enabled': false,
                    }).then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
                }
            } else if (request === 'toggleEmbed') {
                const { toggle, title, text, color } = body;
                if (toggle) {
                    await this.users.updateOne(user, {
                        'settings.embed.enabled': true,
                        'settings.embed.title': title,
                        'settings.embed.text': text,
                        'settings.embed.color': color,
                    }).then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
                } else {
                    await this.users.updateOne(user, {
                        'settings.embed.enabled': false,
                    }).then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
                }
            }
        } else {
            res.json({ success: false, message: 'Invalid session.' });
        }
    }

    /**
     * Delete your account.
     * @param res HTTP Response.
     * @param session User's session.
     */
    async deleteMe(res: Response, session: any) {
        if (session && session.user) {
            const user = await this.users.findOne({ 'user.username': session.user.user.username });
            if (user) {
                session.user = null;
                await user.remove()
                    .then(() => {
                        res.json({ success: true });
                    }).catch((err) => {
                        res.json({ success: false, message: err.message });
                    });
            } else {
                throw new HttpException('Invalid user.', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('Invalid session.', HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Validate a admin request.
     * @param req HTTP Request.
     */
    async validateAdmin (req: Request) {
        if (req.headers.authorization && req.headers.authorization === process.env.API_KEY) {
            return true;
        } else {
            throw new HttpException('Invalid API-key.', HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Validate a admin request.
     * @param req HTTP Request.
     */
    async validateUser (req: Request) {
        if (req.session && req.session.user) {
            return true;
        } else {
            throw new HttpException('You are not logged in.', HttpStatus.UNAUTHORIZED);
        }
    }
}
