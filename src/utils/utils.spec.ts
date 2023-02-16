/* eslint-disable max-nested-callbacks */
/* eslint-disable sonarjs/no-duplicate-string */
import { BadRequestException } from '@nestjs/common';

import { validateDateDiffLessThan } from './helpers';

describe('Utils tests', () => {
    describe('validate date diff less than year', () => {
        it('should return ok for same date', () => {
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            expect(validateDateDiffLessThan('2022-01-01', '2022-01-01')).toBeUndefined();
        });
        it('should return ok for date with different year', () => {
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            expect(validateDateDiffLessThan('2022-01-01', '2023-01-01')).toBeUndefined();
        });
        it('should throw for if from > to', () => {
            expect(() => {
                validateDateDiffLessThan('2022-01-02', '2022-01-01');
            }).toThrow(BadRequestException);
        });
        it('should throw for date diff more than year', () => {
            expect(() => {
                validateDateDiffLessThan('2022-01-01', '2023-01-02');
            }).toThrow(BadRequestException);
        });
    });
});
