/* eslint-disable class-methods-use-this */
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DefaultNamingStrategy, Table } from 'typeorm';

function namingFix(prefix: string, tableOrFullName: Table | string, columnNames: string[]): string {
    let tableName = typeof tableOrFullName === 'string' ? tableOrFullName : tableOrFullName.name;
    const nameArr = tableName.split('.');
    if (nameArr.length > 1) {
        [tableName] = nameArr;
    }
    return `${prefix}___${tableName}___${columnNames.join('__')}`;
}

class CustomNamingStrategy extends DefaultNamingStrategy {
    primaryKeyName(tableOrFullName: Table | string, columnNames: string[]): string {
        return namingFix('PK', tableOrFullName, columnNames);
    }

    uniqueConstraintName(tableOrFullName: Table | string, columnNames: string[]): string {
        return namingFix('UQ', tableOrFullName, columnNames);
    }

    foreignKeyName(tableOrFullName: Table | string, columnNames: string[]): string {
        return namingFix('FK', tableOrFullName, columnNames);
    }

    indexName(tableOrFullName: Table | string, columnNames: string[]): string {
        return namingFix('IDX', tableOrFullName, columnNames);
    }
}

config();

const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: ['./src/db/entities/*.entity.ts'],
    migrationsTableName: 'migrations',
    migrations: ['./src/db/migrations/*.ts'],
    logging: 'all',
    cache: false,
    namingStrategy: new CustomNamingStrategy(),
});
