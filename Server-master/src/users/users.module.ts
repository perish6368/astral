import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminGuard } from './guards/admin.guard';
import { UsersGuard } from './guards/users.guard';
import { User, UserSchema } from './user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [UsersController],
    providers: [
        UsersGuard,
        AdminGuard,
        UsersService,
    ],
})
export class UsersModule {}
