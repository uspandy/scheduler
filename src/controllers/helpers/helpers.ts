import { ValidationPipe } from '@nestjs/common';

export const xRequestIdHeaderName = 'X-Request-Id';

export const baseApiHeadersParams = {
    name: xRequestIdHeaderName,
    description: 'Unique request identifier',
};

export const queryValidationPipe = new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: true,
});

