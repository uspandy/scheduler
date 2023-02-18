/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BadRequestException } from '@nestjs/common';

export function normalizeString(login: string): string {
    return login.toLocaleLowerCase().normalize().
        trim();
}

export const SeparatorPositionISO8601 = 10;

export function normalizeDate(date: string): string {
    return date.slice(0, SeparatorPositionISO8601);
}

/**
 * Get enum member by string (only for previously initialized enums)
 * @param {any} enum_ Enum is searched by
 * @param {string} value Searching symbol
 */
function getEnumMemberByString<T extends Record<string, string>>(
    enum_: T, value: string,
): T[keyof T] | undefined {
    for (const v in enum_) {
        if (enum_[v] === value) {
            return enum_[v];
        }
    }
    return undefined;
}

/**
 * Create array of enum member from string
 * @param {any} enum_ Enum is searched by
 * @param {string} array String array
 */
export function mapToEnum<T extends Record<string, string>>(enum_: T, array: string[]): (T[keyof T])[] {
    return [...new Set(array.reduce<T[keyof T][]>((result, v) => {
        const transformed = getEnumMemberByString(enum_, v);
        if (transformed) {
            result.push(transformed);
        }
        return result;
    }, []))];
}

export function parseNatural(raw: string, defaultValue = 1, minValue?: number, maxValue?: number): number {
    const parsed = parseInt(raw, 10);
    const parsedWithDefault = !Number.isFinite(parsed) || parsed < 1 ? defaultValue : parsed;
    const parsedWithMax =  maxValue && parsedWithDefault > maxValue ? maxValue : parsedWithDefault;
    return minValue && parsedWithMax < minValue ? minValue : parsedWithMax;
}

export function countOffset(page: number, perPage: number): number {
    return (page - 1) * perPage;
}

export function countTotalPages(itemsCount: number, perPage: number): number {
    return ((itemsCount - 1) / perPage | 0) + 1;
}

/**
 * A and B intersect
 */
export function isIntersect<T>(a: T | T[], b: T | T[]): boolean {
    const aP = Array.isArray(a) ? a : [a];
    if (Array.isArray(b)) {
        return b.some(v => aP.includes(v));
    }
    return aP.includes(b);
}

interface IStartEnd {
    start: number
    end: number
}

interface IMaskStringOptions {
    showedPercentOfLength?: IStartEnd
    maxShowedSymbols?: IStartEnd
    hiddenTemplate?: (hiddenCount: number) => string
}

const hiddenWithCountTemplate = (count: number): string => `...(${count} more symbols)...`;

const defaultMaskOptions: Required<IMaskStringOptions> = {
    showedPercentOfLength: {
        start: 10,
        end: 10,
    },
    maxShowedSymbols: {
        start: 10,
        end: 10,
    },
    hiddenTemplate: hiddenWithCountTemplate,
};

/** Hide sensitive data */
export function maskString(str: string, options?: IMaskStringOptions): string {
    const { showedPercentOfLength, maxShowedSymbols, hiddenTemplate } = {
        ...defaultMaskOptions,
        ...options ?? {},
    };
    const showedCountStart = Math.round(
        Math.min(str.length * showedPercentOfLength.start, maxShowedSymbols.start),
    );
    const showedCountEnd = Math.round(
        Math.min(str.length * showedPercentOfLength.end, maxShowedSymbols.end),
    );
    return `${str.slice(0, showedCountStart)}${hiddenTemplate?.(str.length - showedCountStart - showedCountEnd) ?? '...'}${str.slice(str.length - showedCountEnd)}`;
}

// TODO: tests
export function validateDateDiffLessThan(from: string, to: string, maxInYears = 1): void {
    const fromDate = new Date(normalizeDate(from));
    const toDate = new Date(normalizeDate(to));
    const [yearFrom, monthFrom, dateFrom] = [fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()];
    const [yearTo, monthTo, dateTo] = [toDate.getFullYear(), toDate.getMonth(), toDate.getDate()];
    // Same date special case, we have to check this due to dateFrom >= dateTo in next check
    if (yearFrom === yearTo && monthFrom === monthTo && dateFrom === dateTo) {
        return;
    }
    let diff = yearTo - yearFrom;
    // Explain why dateFrom >= dateTo: because 2022-01-01 and 2023-01-01 is valid range
    if (monthFrom > monthTo || (monthFrom === monthTo && dateFrom >= dateTo)) { diff -= 1; }
    if (diff < 0) {
        throw new BadRequestException(`Parameter 'from': '${from}' must be less or equal then parameter 'to': '${to}'`);
    }
    if (diff > (maxInYears - 1)) {
        throw new BadRequestException(`Maximum range is ${maxInYears} year(s)`);
    }
}
