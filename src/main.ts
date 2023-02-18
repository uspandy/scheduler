/* eslint-disable no-console */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as winston from 'winston';

import { AppModule } from './app.module';
import { onAppInit } from './init';

const DEFAULT_APP_PORT = 3000;

dotenv.config();

async function bootstrap(): Promise<void> {
    console.log('\n--------------------------- ALLOWED DIGEST ---------------------------');
    console.log(crypto.getHashes().join(', '));
    console.log('----------------------------------------------------------------------');

    const app = await NestFactory.create(AppModule, {
        logger: ['verbose', 'debug', 'warn', 'log', 'error'],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            validationError: { target: false },
            whitelist: true,
            forbidUnknownValues: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );


    const options = new DocumentBuilder().
        setTitle('Scheduler').
        setDescription('Scheduler test task API description').
        setVersion('1.0').
        addBearerAuth().
        build();

    const document = SwaggerModule.createDocument(app, options);
    if (!process.env.SKIP_CONTRACT_GENERATION) {
        fs.writeFileSync(
            './scheduler_contracts.json',
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            JSON.stringify(document, null, 2),
        );
    }
    SwaggerModule.setup('swagger', app, document);

    const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        defaultMeta: { service: 'sm-key-master' },
        transports: [
            new winston.transports.Console({}),
        ],
    });

    process.on('uncaughtException', error => {
        logger.error('ERROR | uncaughtException', { module: 'main.ts', method: 'uncaughtException', error });
    });

    process.on('unhandledRejection', reason => {
        if (reason instanceof Error) {
            logger.error(reason.message);
        }
        logger.error('ERROR | unhandledRejection', { module: 'main.ts', method: 'uncaughtException', error: reason });
    });

    await app.listen(process.env.APP_PORT ?? DEFAULT_APP_PORT);

    await onAppInit(app);
}

void bootstrap();
