import { Controller, Post, Res, Body, Session, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDTO, RegisterDTO } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private service: AuthService
    ) {}

    @Post('login')
    async login(@Res() res: Response, @Body() body: LoginDTO, @Session() session: any) {
        await this.service.login(res, body, session);
    }

    @Post('register')
    async register(@Res() res: Response, @Body() body: RegisterDTO, @Session() session: any) {
        await this.service.register(res, body, session);
    }

    @Get('logout')
    logout(@Res() res: Response, @Session() session: any) {
        this.service.logout(res, session);
    }

    @Get('discord/link')
    linkDiscord(@Res() res: Response, @Session() session: any) {
        this.service.redirect(res, session);
    }

    @Get('discord/callback')
    async callback(@Res() res: Response, @Session() session: any, @Query('code') code: string) {
        await this.service.linkAccount(res, session, code);
    }
}
