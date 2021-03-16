import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import { SessionModule } from 'nestjs-session';
import { UsersService } from '../users/users.service';
import { AppService } from './app.service';
import { FilesModule } from 'src/files/files.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/testing'),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        SessionModule.forRoot({
            session: {
                secret: 'awoudijhopawidj098auwealewouifhpaowileufhlawieuofh',
                saveUninitialized: true,
                resave: true,
                cookie: { maxAge: 30 * 60 * 1000 },
            },
        }),
        FilesModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [UsersService, AppService],
})
export class AppModule {}
