import { Body, Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { UploadGuard } from './guards/upload.guard';
import { promises, existsSync } from 'fs';
import { join, extname } from 'path';
import { Request, Response } from 'express';
import { DeleteGuard } from './guards/delete.guard';
import { WipeDTO } from './dtos/files.dto';

@Controller('files')
export class FilesController {
    constructor (
        private service: FilesService
    ) {}

    @Post()
    @UseGuards(UploadGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: async (req, res, cb) => {
                const key = <string>req.headers.key;
                if (key) {
                    if (!existsSync(join(__dirname, '../../uploads', key))) {
                        await promises.mkdir(join(__dirname, '../../uploads', key));
                    }
                    cb(null, join(__dirname, '../../uploads', key));
                }
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + extname(file.originalname));
            },
        }),
    }))
    async uploadFile (@Res() res: Response, @Req() req: Request, @UploadedFile() file: any) {
        await this.service.uploadFile(res, req, file);
    }

    @Delete('wipe')
    @UseGuards(DeleteGuard)
    async wipeFiles (@Res() res: Response, @Req() req: Request, @Body() body: WipeDTO) {
        await this.service.wipeFiles(res, req, body);
    }

    @Delete(':file')
    @UseGuards(DeleteGuard)
    async deleteFile (@Res() res: Response, @Req() req: Request, @Param('file') file: string) {
        await this.service.deleteFile(res, req, file);
    }

    @Get(':file')
    async getFile (@Res() res: Response, @Param('file') file: string) {
        await this.service.sendFile(res, file);
    }
}
