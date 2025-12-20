import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // CORS configuration
    app.enableCors({
        origin: '*', // Explicitly allow all origins for production debugging
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Global prefix for all routes
    app.setGlobalPrefix('api');

    const port = configService.get('PORT') || 4000;
    await app.listen(port);

    console.log(`🚀 Cricket SaaS Backend running on http://localhost:${port}`);
    console.log(`📡 API available at http://localhost:${port}/api`);
}

bootstrap();
