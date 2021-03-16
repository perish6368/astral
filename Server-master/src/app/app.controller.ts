import { Controller, Get, HttpException, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { getUploads } from '../utils/environment';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor (
        private service: AppService
    ) {}

    @Get('config')
    async getConfig (@Res() res: Response, @Query('key') key: string) {
        await this.service.getConfig(res, key);
    }

    @Get('domains')
    async getDomains (@Res() res: Response) {
        await this.service.getDomains(res);
    }

    @Get('i/:file')
    async getFile (@Res() res: Response, @Param('file') file: string) {
        const uploads = await getUploads(join(__dirname, '../../', 'uploads'), file);
        if (uploads.length !== 0) {
            res.sendFile(uploads[0], (err) => {
                if (err) throw new HttpException('Invalid file.', HttpStatus.NOT_FOUND);
            });
        } else {
            throw new HttpException('Invalid file.', HttpStatus.NOT_FOUND);
        }
    }
}
