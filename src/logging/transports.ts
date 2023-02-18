/**
 * Файловые транспорты с ротацией.
 */
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const fileLogsTransport = new DailyRotateFile({
    filename: 'logs/log-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '3d',
});

export const fileErrorsLogsTransport = new DailyRotateFile({
    filename: 'logs/errors-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '3d',
    level: 'error',
});

