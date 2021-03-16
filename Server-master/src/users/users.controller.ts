import { Body, Controller, Delete, Get, Param, Post, Res, Session, UseGuards, Put } from '@nestjs/common';
import { Response } from 'express';
import { CreateDTO, DeleteDTO } from './dtos/users.dto';
import { AdminGuard } from './guards/admin.guard';
import { UsersGuard } from './guards/users.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor (
        private service: UsersService
    ) {}

    @Post()
    @UseGuards(AdminGuard)
    async createUser (@Res() res: Response, @Body() body: CreateDTO) {
        await this.service.create(res, body);
    }

    @Delete()
    @UseGuards(AdminGuard)
    async deleteUser (@Res() res: Response, @Body() body: DeleteDTO) {
        await this.service.delete(res, body);
    }

    @Get('count')
    async countUsers (@Res() res: Response) {
        await this.service.countUsers(res);
    }

    @Get('@me')
    @UseGuards(UsersGuard)
    async getMe (@Res() res: Response, @Session() session: any) {
        await this.service.getMe(res, session);
    }

    @Delete('@me')
    async deleteMe(@Res() res: Response, @Session() session: any) {
        await this.service.deleteMe(res, session);
    }

    @Get(':user')
    @UseGuards(AdminGuard)
    async getUser (@Res() res: Response, @Param('user') user: string) {
        await this.service.getUser(res, user);
    }

    @Put()
    @UseGuards(UsersGuard)
    async putUser(@Res() res: Response, @Session() session: any, @Body() body: any) {
        await this.service.updateUser(res, session, body);
    }
}
