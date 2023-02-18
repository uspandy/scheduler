import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsInt,
    IsISO8601,
    IsNotEmpty,
    IsString,
    Length,
    Max,
    Min,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';
import { parseNatural, SeparatorPositionISO8601, validateDateDiffLessThan } from 'src/utils/helpers';

const itemsPerPageParams = {
    description: 'Items per page',
    'default': 10,
    minimum: 10,
    maximum: 200,
};

const currentPageParams = {
    description: 'Current page',
    'default': 1,
    minimum: 1,
    maximum: 65536,
};

const fromParams = {
    description: 'Query search by start date (from) (ISO string)',
    maxLength: SeparatorPositionISO8601,
    minLength: SeparatorPositionISO8601,
};

const toParams = {
    description: 'Query search by start date (to) (ISO string)',
    maxLength: SeparatorPositionISO8601,
    minLength: SeparatorPositionISO8601,
};

export class ListResponse {
    @ApiProperty({
        description: 'Total items in list',
    })
    totalItems: number;

    @ApiProperty(itemsPerPageParams)
    itemsPerPage: number;

    @ApiProperty(currentPageParams)
    currentPage: number;

    @ApiProperty({
        description: 'Total pages',
    })
    totalPages: number;

    constructor(v?: ListResponse) {
        if (v) {
            this.totalPages = v.totalPages;
            this.currentPage = v.currentPage;
            this.itemsPerPage = v.itemsPerPage;
            this.totalItems = v.totalItems;
        }
    }
}

export class BaseListQueryParams {
    @ApiProperty(itemsPerPageParams)
    @IsNotEmpty()
    @IsInt()
    @Min(itemsPerPageParams.minimum)
    @Max(itemsPerPageParams.maximum)
    @Transform(({ value }) => {
        const { minimum, maximum } = itemsPerPageParams;
        return parseNatural(value as string, itemsPerPageParams.default, minimum, maximum);
    })
    perPage: number;

    @ApiProperty(currentPageParams)
    @IsNotEmpty()
    @IsInt()
    @Min(currentPageParams.minimum)
    @Max(currentPageParams.maximum)
    @Transform(({ value }) => {
        const { minimum, maximum } = currentPageParams;
        return parseNatural(value as string, itemsPerPageParams.default, minimum, maximum);
    })
    page: number;

    constructor(v?: BaseListQueryParams) {
        if (v) {
            this.page = v.page;
            this.perPage = v.perPage;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsDateDiffLessThanYear(startDateField: string, validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string): void => {
        registerDecorator({
            name: 'isDateDiffLessThanYear',
            target: object.constructor,
            propertyName,
            constraints: [startDateField],
            options: validationOptions,
            validator: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                validate(to: any, args: ValidationArguments): boolean {
                    const [fromFieldName] = args.constraints as string[];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                    const from = (args.object as any)[fromFieldName];
                    if (typeof from === 'string' && typeof to === 'string') {
                        validateDateDiffLessThan(from, to, 1);
                    }
                    return true;
                },
            },
        });
    };
}

export class TimeRangeListQueryParams extends BaseListQueryParams {
    @ApiProperty(fromParams)
    @IsNotEmpty()
    @IsString()
    @Length(fromParams.minLength, fromParams.maxLength)
    @IsISO8601({ strict: true })
    from: string;

    @ApiProperty(toParams)
    @IsNotEmpty()
    @IsString()
    @Length(toParams.minLength, toParams.maxLength)
    @IsISO8601({ strict: true })
    @IsDateDiffLessThanYear('from')
    to: string;

    constructor(v?: TimeRangeListQueryParams) {
        super(v);
        if (v) {
            validateDateDiffLessThan(v.from, v.to, 1);
            this.from = v.from;
            this.to = v.to;
        }
    }
}
