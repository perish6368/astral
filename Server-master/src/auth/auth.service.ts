import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { Response } from 'express';
import { LoginDTO, RegisterDTO } from './dtos/auth.dto';
import { verify, hash } from 'argon2';
import { generateKey } from '../utils/environment';
import { getUser, addGuildMember } from '../utils/environment/oauth';

@Injectable()
export class AuthService {
    constructor (
        @InjectModel(User.name) private users: Model<User>
    ) {}

    /**
     * Login a user.
     * @param res HTTP Response.
     * @param body Request body, user's credentials.
     * @param session User's session, if exists.
     */
    async login(res: Response, body: LoginDTO, session: any) {
        if (session.user) {
            return res.json({ success: false, message: 'You are already logged in.' });
        } else {
            const { username, password } = body;
            if (username && password) {
                const user = await this.users.findOne({ 'user.username': username });
                if (user) {
                    verify(user.user.password, password)
                        .then((validPassword) => {
                            if (validPassword) {
                                delete user.user.password;
                                session.user = user;
                                return res.json({ success: true, message: 'Logged in successfully.' });
                            } else {
                                return res.json({ success: false, message: 'Invalid password.' });
                            }
                        }).catch(() => {
                            return res.json({ success: false, message: 'Something went wrong, please DM aspect#6910.' });
                        });
                } else {
                    return res.json({ success: false, message: 'Invalid username.' });
                }
            } else {
                return res.json({ success: false, message: 'Invalid fields.' });
            }
        }
    }

    /**
     * Register a user.
     * @param res HTTP Response
     * @param body Request body, user's credentials.
     * @param session User's session, if exists.
     */
    async register(res: Response, body: RegisterDTO, session: any) {
        if (session.user) {
            return res.json({ success: false, message: 'You are already logged in.' });
        } else {
            const { username, password, invite } = body;
            if (username && password && invite) {
                if (username.trim().length < 1 || password.trim().length < 3) {
                    return res.json({ success: false, message: 'Your username/password is too short.' });
                } else {
                    if (await this.users.findOne({ 'user.username': { $regex: new RegExp(username, 'i') } })) {
                        return res.json({ success: false, message: 'This username already exists.' });
                    } else {
                        const findInvite = await this.users.findOne({ 'user.invite': invite });
                        if (findInvite) {
                            if (findInvite.user.username !== null) {
                                return res.json({ success: false, message: 'This invite has already been redeemed.' });
                            } else {
                                if (findInvite.stats.invitedBy !== 'Unknown') {
                                    const inviter = await this.users.findOne({ 'user.username': findInvite.stats.invitedBy });
                                    if (inviter) {
                                        await this.users.updateOne({ 'user.invite': inviter.user.invite }, {
                                            $push: {
                                                'stats.invitedUsers': username,
                                            },
                                        });
                                    }
                                }
                                await this.users.updateOne(findInvite, {
                                    'user.username': username,
                                    'user.password': await hash(password),
                                    'user.key': generateKey(),
                                    'stats.registrationDate': new Date().toLocaleDateString(),
                                }).then(async () => {
                                    session.user = await this.users.findOne({ 'user.invite': invite });
                                    return res.json({ success: true, message: 'Registered successfully.' });
                                }).catch((err) => {
                                    return res.json({ success: false, message: err.message });
                                });
                            }
                        } else {
                            return res.json({ success: false, message: 'Invalid invite code.' });
                        }
                    }
                }
            } else {
                return res.json({ success: false, message: 'Invalid fields.' });
            }
        }
    }

    /**
     * Redirect a user to the auth uri.
     * @param res HTTP Response.e
     * @param session User's session.
     */
    redirect(res: Response, session: any) {
        if (session.user) {
            res.redirect(process.env.DISCORD_URI);
        } else {
            res.redirect('http://localhost:3000');
        }
    }

    /**
     * Link a user's discord account to their account.
     * @param res HTTP Response.
     * @param session User's session.
     * @param code OAuth2 Code.
     */
    async linkAccount(res: Response, session: any, code: string) {
        if (session.user) {
            if (code) {
                const data = (await getUser(code));
                if (data.user) {
                    await addGuildMember(data)
                        .then(async () => {
                            await this.users.updateOne({
                                'user.username': session.user.user.username,
                            }, {
                                'user.discordId': data.user.id,
                                'user.discordAvatar': data.user.avatar,
                            });
                        });
                    session.user = await this.users.findOne({ 'user.discordId': data.user.id });
                    res.redirect('http://localhost:3001/dashboard');
                } else {
                    res.redirect(process.env.DISCORD_URI);
                }
            } else {
                res.redirect(process.env.DISCORD_URI);
            }
        } else {
            res.redirect('http://localhost:3001');
        }
    }
    
    logout(res: Response, session: any) {
        if (session && session.user) {
            session.destroy();
            return res.json({ success: true, message: 'Logged out successfully.' });
        } else {
            return res.json({ success: false, message: 'Invalid session.' });
        }
    }
}
