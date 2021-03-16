import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import { File, FileSchema } from './file.schema';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UploadGuard } from './guards/upload.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: File.name, schema: FileSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [FilesController],
    providers: [
        FilesService,
        UploadGuard,
    ],
})
export class FilesModule {}
