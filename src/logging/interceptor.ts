import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { xRequestIdHeaderName } from 'src/controllers/helpers/helpers';
import { Logger } from 'winston';

const ID_REGEX =
  /[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}|\w+-\d{3,6}-[a-z]{3}|\d{3,4}-\w+-\d{3,4}-[a-z]{3}-\d{6,8}/gui;
const UUID_REPLACED_STUB = 'ID';

const LOG_EMPTY_STRING = '---';

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

interface ILoggerError {
  error: string
  stack?: string
  code?: string
}

interface ILoggerRequest {
  httpMethod: string
  baseUrl: string
  url: string
  urlMask: string
  headers?: Record<string, unknown>
  params?: Record<string, unknown>[]
  data?: Record<string, unknown>
  timeout: number | typeof LOG_EMPTY_STRING
}

interface ILoggerResponse {
  status: number
  data?: Record<string, unknown>
  headers?: Record<string, unknown>
}

interface ILoggerMessage {
  module: string
  functionName: string
  type: 'outgoing' | 'incoming' | 'internal'
  requestTime: number | typeof LOG_EMPTY_STRING
  request?: ILoggerRequest
  response?: ILoggerResponse
  error?: ILoggerError
  level: 'info' | 'warn' | 'error'
  requestId: string
  message: string
}

function createUrlMask(url?: string): string {
    if (url) {
        return url.replace(ID_REGEX, UUID_REPLACED_STUB).split('?')[0];
    }
    return LOG_EMPTY_STRING;
}

function getRequestId(headers?: Record<string, unknown>): string {
    return (headers?.[xRequestIdHeaderName] as string) ||
  (headers?.[xRequestIdHeaderName.toLocaleLowerCase()] as string) ||
  (headers?.requestId as string) ||
  LOG_EMPTY_STRING;
}

function baseLoggerMessage(
    commonMeta: ILoggerMessage,
    request: ExpressRequest,
    statusCode: number,
    startTime?: number,
): ILoggerMessage {
    return {
        ...commonMeta,
        requestTime: startTime ? (performance.now() - startTime) / 1000 : LOG_EMPTY_STRING,
        request: {
            httpMethod: request.method,
            baseUrl: request.baseUrl,
            url: request.url,
            urlMask: createUrlMask(request.url),
            timeout: LOG_EMPTY_STRING,
        },
        response: {
            status: statusCode,
        },
    };
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
type GenericError = string | Record<string, unknown>;

function stringifyFlatError(error: GenericError): string {
    let errorMessage: string;
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (typeof error.message === 'string') {
        errorMessage = error.message;
    } else if (typeof error.error === 'string') {
        errorMessage = error.error;
    } else {
        errorMessage = JSON.stringify(error);
    }
    return errorMessage;
}

function stringifyError(
    error: unknown,
): string {
    let errorMessage = 'Unknown error';
    if (error) {
        if (Array.isArray(error)) {
            const errors: string[] = [];
            for (const e of error) {
                errors.push(stringifyFlatError(e as GenericError));
            }
            errorMessage = errors.join(' ,');
        } else {
            errorMessage = stringifyFlatError(error as GenericError);
        }
    }
    return errorMessage;
}


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request: ExpressRequest = context.switchToHttp().getRequest();

        const commonMeta: ILoggerMessage = {
            functionName: context.getHandler()?.name || LOG_EMPTY_STRING,
            module: context.getClass()?.name || 'Common logger interceptor',
            requestId: getRequestId(request.headers),
            requestTime: request.socket?.timeout ?? LOG_EMPTY_STRING,
            type: 'incoming',
            level: 'info',
            message: 'Request successful',
        };

        const startTime = performance.now();

        return next.handle().pipe(
            tap(_data => {
                const response: ExpressResponse = context.switchToHttp().getResponse();
                this.logger.info(baseLoggerMessage(
                    commonMeta,
                    request,
                    response.statusCode,
                    startTime,
                ));
            }),
            catchError((error: HttpException | Error, _) => {
                let errorMessage: ILoggerMessage = {
                    ...commonMeta,
                    message: error.name,
                    level: 'error',
                };
                let exception: HttpException;
                if (error instanceof HttpException) {
                    errorMessage = {
                        ...errorMessage,
                        type: 'outgoing',
                        error: {
                            error: stringifyError(error.getResponse()),
                            stack: error.stack,
                        },
                        response: {
                            status: error.getStatus(),
                        },
                    };
                    exception = error;
                } else {
                    errorMessage = {
                        ...errorMessage,
                        type: 'internal',
                        error: {
                            error: error.message,
                            stack: error.stack,
                        },
                        response: {
                            status: HttpStatus.INTERNAL_SERVER_ERROR,
                        },
                    };
                    exception = new InternalServerErrorException(error.message ?? INTERNAL_ERROR_MESSAGE);
                }
                if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
                    errorMessage.level = 'warn';
                }
                this.logger.log(baseLoggerMessage(
                    errorMessage,
                    request,
                    exception.getStatus(),
                    startTime,
                ));
                return throwError(() => exception);
            }),
        );
    }
}
