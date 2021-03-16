import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors({ credentials: true, origin: true });
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
